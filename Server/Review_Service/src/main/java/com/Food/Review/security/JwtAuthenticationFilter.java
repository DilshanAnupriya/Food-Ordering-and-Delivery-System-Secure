//package com.Food.Review.security;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Arrays;
//import java.util.List;
//import java.util.stream.Collectors;
//
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        // Extract username and roles from headers (set by API Gateway)
//        String username = request.getHeader("X-Username");
//        String roles = request.getHeader("X-Roles");
//
//        if (username != null && roles != null) {
//            // Create authorities from roles
//            List<SimpleGrantedAuthority> authorities = Arrays.stream(roles.split(","))
//                    .map(SimpleGrantedAuthority::new)
//                    .collect(Collectors.toList());
//
//            // Create authentication token
//            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
//                    username, null, authorities);
//
//            // Set authentication in Security Context
//            SecurityContextHolder.getContext().setAuthentication(auth);
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}