package com.OrderManagement.OrderManagement.audit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class SecurityAuditRequestFilter extends OncePerRequestFilter {
    private final JwtParser parser;

    public SecurityAuditRequestFilter(@Value("${security.audit.jwt-secret:}") String secret) {
        // AUDIT FIX: match the gateway's signature validation. Missing configuration means
        // UNVERIFIED, never silently trust a caller-supplied identity header.
        parser = secret.isBlank() ? null : Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String actor = "UNVERIFIED";
        String source = "UNVERIFIED";
        String authorization = request.getHeader("Authorization");
        if (parser != null && authorization != null && authorization.startsWith("Bearer ")) {
            try {
                Claims claims = parser.parseClaimsJws(authorization.substring(7)).getBody();
                String candidate = claims.get("userId", String.class);
                if (candidate == null) candidate = claims.getSubject();
                // Require expiration and a bounded identifier; do not store tokens or arbitrary text.
                if (claims.getExpiration() != null && candidate != null
                        && candidate.matches("[A-Za-z0-9@._:+-]{1,128}")) {
                    actor = candidate;
                    source = "VERIFIED_JWT";
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // Audit attribution only. Existing authorization rules still determine access.
                // Never log the token or exception text (which may contain credential material).
            }
        }
        String requestId = UUID.randomUUID().toString();
        request.setAttribute(AuditContext.ATTRIBUTE, new AuditContext(actor, source, requestId));
        response.setHeader("X-Request-ID", requestId);
        chain.doFilter(request, response);
    }
}
