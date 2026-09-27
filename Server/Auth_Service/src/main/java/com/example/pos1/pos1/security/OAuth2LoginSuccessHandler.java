package com.example.pos1.pos1.security;

import com.example.pos1.pos1.entity.ApplicationUser;
import com.example.pos1.pos1.entity.UserRole;
import com.example.pos1.pos1.jwt.JwtConfig;
import com.example.pos1.pos1.repo.ApplicationUserRepo;
import com.example.pos1.pos1.repo.ApplicationUserRoleRepo;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Fires after a successful Google OAuth2/OIDC login. Auto-provisions a local
 * ApplicationUser (role USER) on first login by email, then issues the same
 * kind of JWT the password login path issues, so every downstream service
 * (gateway, JwtTokeVerifier, etc.) treats both login methods identically.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final ApplicationUserRepo userRepo;
    private final ApplicationUserRoleRepo roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final SecretKey secretKey;
    private final String frontendRedirectUri;
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    public OAuth2LoginSuccessHandler(ApplicationUserRepo userRepo,
                                      ApplicationUserRoleRepo roleRepo,
                                      PasswordEncoder passwordEncoder,
                                      JwtConfig jwtConfig,
                                      SecretKey secretKey,
                                      @Value("${application.oauth2.frontendRedirectUri}") String frontendRedirectUri) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtConfig = jwtConfig;
        this.secretKey = secretKey;
        this.frontendRedirectUri = frontendRedirectUri;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();
        String fullName = oidcUser.getFullName() != null ? oidcUser.getFullName() : email;

        ApplicationUser user = userRepo.findByUsername(email)
                .orElseGet(() -> userRepo.save(createOAuthUser(email, fullName)));

        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        for (UserRole role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName()));
        }

        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("authorities", authorities)
                .claim("userId", user.getUserId())
                .claim("restaurantId", user.getRestaurantId())
                .setIssuedAt(new Date())
                .setExpiration(java.sql.Date.valueOf(LocalDate.now().plusDays(jwtConfig.getTokenExpirationAfterDays())))
                .signWith(secretKey)
                .compact();

        String redirectUrl = frontendRedirectUri + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        redirectStrategy.sendRedirect(request, response, redirectUrl);
    }

    private ApplicationUser createOAuthUser(String email, String fullName) {
        UserRole userRole = roleRepo.findByRoleName("USER")
                .orElseThrow(() -> new IllegalStateException("USER role not found"));

        Set<UserRole> roles = new HashSet<>();
        roles.add(userRole);

        return ApplicationUser.builder()
                .userId(UUID.randomUUID().toString())
                .username(email)
                .fullName(fullName)
                // OAuth-provisioned accounts have no local password; random value
                // keeps the NOT NULL column satisfied without a usable credential.
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .roles(roles)
                .isAccountNonExpired(true)
                .isAccountNonLocked(true)
                .isCredentialsNonExpired(true)
                .isEnabled(true)
                .build();
    }
}
