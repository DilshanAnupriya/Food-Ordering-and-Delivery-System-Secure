package com.example.pos1.pos1.jwt;

import com.example.pos1.pos1.dto.request.ApplicationUserLoginDto;
import com.example.pos1.pos1.entity.ApplicationUser;
import com.example.pos1.pos1.repo.ApplicationUserRepo;
import com.example.pos1.pos1.service.LoginAttemptService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

public class JwtUsernameAndPasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final ApplicationUserRepo userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtConfig jwtConfig;
    private final SecretKey secretKey;
    private final LoginAttemptService loginAttemptService;

    public JwtUsernameAndPasswordAuthenticationFilter(
            AuthenticationManager authenticationManager,
            JwtConfig jwtConfig,
            SecretKey secretKey,
            ApplicationUserRepo userRepository,
            LoginAttemptService loginAttemptService) {
        this.authenticationManager = authenticationManager;
        this.jwtConfig = jwtConfig;
        this.secretKey = secretKey;
        this.userRepository = userRepository;
        this.loginAttemptService = loginAttemptService;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {
        String username;
        try {
            ApplicationUserLoginDto requestApplicationUserLoginDto =
                    new ObjectMapper().readValue(request.getInputStream(),
                            ApplicationUserLoginDto.class);
            username = requestApplicationUserLoginDto.getUsername();

            // Fix (V-AuthWeakness Test 4 - No lockout): reject login while the
            // account is locked due to repeated failures. Auto-unlocks once the
            // lock window has elapsed.
            if (loginAttemptService.isLocked(username)) {
                request.setAttribute("minutesRemaining", loginAttemptService.getMinutesUntilUnlock(username));
                throw new LockedException(
                        "Account is locked due to multiple failed login attempts. Please try again later.");
            }

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    requestApplicationUserLoginDto.getUsername(),
                    requestApplicationUserLoginDto.getPassword()
            );

            try {
                return authenticationManager.authenticate(authentication);
            } catch (BadCredentialsException e) {
                // Count the failed attempt (and lock the account when the
                // threshold is reached) before propagating the failure.
                loginAttemptService.loginFailed(username);
                if (loginAttemptService.isLocked(username)) {
                    // This attempt was the one that tripped the lock: report it
                    // as a lockout so the user sees the cooling-off time.
                    request.setAttribute("minutesRemaining", loginAttemptService.getMinutesUntilUnlock(username));
                    throw new LockedException(
                            "Account is locked due to multiple failed login attempts. Please try again later.");
                }
                // Still allowed to retry: tell the user how many attempts remain.
                request.setAttribute("attemptsRemaining", loginAttemptService.getRemainingAttempts(username));
                throw e;
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private ApplicationUser getUserFromPrincipal(Object principal) {
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            // Fetch user from repository
            Optional<ApplicationUser> userOptional = userRepository.findByUsername(username);
            return userOptional.orElse(null);
        }
        return null;
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult) throws IOException, ServletException {
        // Fix (V-AuthWeakness Test 4): clear the failed-attempt counter on a
        // successful login so a legitimate user is never progressively locked out.
        loginAttemptService.loginSucceeded(authResult.getName());

        // Get user principal
        Object principal = authResult.getPrincipal();

        // Get user from database
        ApplicationUser user = getUserFromPrincipal(principal);

        // Extract userId and restaurantId from the user entity
        String userId = user != null ? user.getUserId() : null;
        String restaurantId = user != null ? user.getRestaurantId() : null;

        // Debug logging
        System.out.println("Debug - userId: " + userId);
        System.out.println("Debug - restaurantId: " + restaurantId);

        // Check if user is null
        if (user == null) {
            System.out.println("Warning: User object is null");
        } else {
            System.out.println("User found with username: " + user.getUsername());
        }

        String token = Jwts.builder()
                .setSubject(authResult.getName())
                .claim("authorities", authResult.getAuthorities())
                // Add userId as a claim
                .claim("userId", userId)
                .claim("restaurantId", restaurantId) // Correctly add restaurantId claim
                .setIssuedAt(new Date())
                .setExpiration(
                        java.sql.Date.valueOf(LocalDate.now()
                                .plusDays(jwtConfig.getTokenExpirationAfterDays()))
                )
                .signWith(secretKey)
                .compact();

        response.addHeader(HttpHeaders.AUTHORIZATION, jwtConfig.getTokenPrefix() + token);

        // Include both userId and restaurantId in the response body
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\", \"userId\":\"" + userId + "\", \"restaurantId\":\"" + restaurantId + "\"}");
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        // Fix (V-AuthWeakness Test 4): return a clear, correct status plus the
        // remaining-attempts / lock-time information the UI shows as toasts.
        // A locked account responds with 423 LOCKED; other credential failures
        // respond with 401 UNAUTHORIZED (the original code fell through to 403).
        boolean locked = failed instanceof LockedException;
        int status = locked ? 423 : 401;

        Object attemptsRemaining = request.getAttribute("attemptsRemaining");
        Object minutesRemaining = request.getAttribute("minutesRemaining");

        String message;
        if (locked) {
            long mins = (minutesRemaining instanceof Long) ? (Long) minutesRemaining : 0L;
            message = "Account locked due to too many failed login attempts. Try again in "
                    + mins + " minute(s).";
        } else if (attemptsRemaining instanceof Integer) {
            message = "Invalid username or password. " + attemptsRemaining
                    + " attempt(s) remaining before your account is locked.";
        } else {
            message = (failed.getMessage() == null) ? "Authentication failed" : failed.getMessage();
        }
        // Escape quotes so the JSON body stays valid.
        message = message.replace("\"", "'");

        StringBuilder body = new StringBuilder();
        body.append("{\"message\":\"").append(message).append("\"");
        if (attemptsRemaining instanceof Integer) {
            body.append(",\"attemptsRemaining\":").append(attemptsRemaining);
        }
        if (locked && minutesRemaining instanceof Long) {
            body.append(",\"minutesRemaining\":").append(minutesRemaining);
        }
        body.append("}");

        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(body.toString());
    }
}