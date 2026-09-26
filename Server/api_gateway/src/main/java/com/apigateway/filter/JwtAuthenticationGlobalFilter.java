package com.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fix for V-AuthWeakness Test 1 (Gateway authenticates nothing).
 *
 * The original API Gateway performed no authentication, so any request - with no
 * token or an invalid token - was routed straight through to the downstream
 * microservices (which have no security of their own). This global filter makes
 * the gateway validate the JWT (signature + expiry) on EVERY routed request,
 * denying by default. Only an explicit allowlist of public endpoints (login,
 * registration, public browsing, CORS preflight) is permitted without a token.
 *
 * The signing key is the same secret used by the Auth service, injected from the
 * JWT_SECRET environment variable (see V-AuthWeakness Test 3).
 */
@Component
public class JwtAuthenticationGlobalFilter implements GlobalFilter, Ordered {

    private final SecretKey secretKey;

    // Public regardless of HTTP method (authentication endpoints).
    private static final List<String> PUBLIC_ANY = List.of(
            "/login",
            "/api/v1/users/visitor"
    );

    // Public for GET only (anonymous browsing of the catalogue).
    private static final List<String> PUBLIC_GET = List.of(
            "/api/v1/restaurants",
            "/api/v1/foods",
            "/api/v1/restaurant-reviews"
    );

    // Public for POST only (a visitor submitting the Contact Us form).
    private static final List<String> PUBLIC_POST = List.of(
            "/api/v1/contactus"
    );

    public JwtAuthenticationGlobalFilter(@Value("${application.jwt.secretKey}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        HttpMethod method = request.getMethod();

        // Always allow CORS preflight requests.
        if (HttpMethod.OPTIONS.equals(method)) {
            return chain.filter(exchange);
        }

        // Allow explicitly public endpoints without a token.
        if (isPublic(path, method)) {
            return chain.filter(exchange);
        }

        // Everything else requires a valid Bearer token.
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, "Authentication required: missing bearer token");
        }

        String token = authHeader.substring(7).trim();
        try {
            // Validates the HMAC signature AND the expiry; throws on failure.
            Jws<Claims> claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            // Token is valid. Forward the authenticated identity downstream so
            // services can enforce object-level authorization (V-BrokenAccess /
            // IDOR fix) without re-parsing the token. These headers are set from
            // the validated JWT and OVERWRITE any client-supplied values, so a
            // caller cannot spoof their identity or roles.
            Claims body = claims.getBody();
            String username = body.getSubject();
            String userId = body.get("userId", String.class);
            String roles = extractRoles(body);
            ServerWebExchange mutated = exchange.mutate()
                    .request(r -> r.headers(h -> {
                        h.set("X-Auth-Username", username == null ? "" : username);
                        h.set("X-Auth-User-Id", userId == null ? "" : userId);
                        h.set("X-Auth-Roles", roles);
                    }))
                    .build();
            return chain.filter(mutated);
        } catch (Exception e) {
            return unauthorized(exchange, "Authentication failed: invalid or expired token");
        }
    }

    /** Flatten the JWT "authorities" claim into a comma-separated roles string. */
    @SuppressWarnings("unchecked")
    private String extractRoles(Claims body) {
        Object authorities = body.get("authorities");
        if (authorities instanceof List) {
            return ((List<Object>) authorities).stream()
                    .filter(o -> o instanceof Map)
                    .map(o -> String.valueOf(((Map<String, Object>) o).get("authority")))
                    .filter(s -> s != null && !s.isEmpty() && !"null".equals(s))
                    .collect(Collectors.joining(","));
        }
        return "";
    }

    private boolean isPublic(String path, HttpMethod method) {
        for (String p : PUBLIC_ANY) {
            if (path.startsWith(p)) {
                return true;
            }
        }
        if (HttpMethod.GET.equals(method)) {
            for (String p : PUBLIC_GET) {
                if (path.startsWith(p)) {
                    return true;
                }
            }
        }
        if (HttpMethod.POST.equals(method)) {
            for (String p : PUBLIC_POST) {
                if (path.startsWith(p)) {
                    return true;
                }
            }
        }
        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] bytes = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        // Run before the routing/forwarding filters so unauthenticated requests
        // are rejected at the gateway and never reach downstream services.
        return -1;
    }
}
