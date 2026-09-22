package com.apigateway.config;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Fix V3 (Security Misconfiguration): adds HTTP security-response headers to
 * every response routed through the gateway. Previously the gateway defined
 * only CORS configuration and set no security headers, so OWASP ZAP flagged
 * missing X-Content-Type-Options, X-Frame-Options and Content-Security-Policy.
 */
@Component
@Order(-1) // run before routing so the headers are on every response
public class SecurityHeadersFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        HttpHeaders headers = exchange.getResponse().getHeaders();
        headers.set("X-Content-Type-Options", "nosniff");
        headers.set("X-Frame-Options", "DENY");
        headers.set("Referrer-Policy", "no-referrer");
        headers.set("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'");
        headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        return chain.filter(exchange);
    }
}