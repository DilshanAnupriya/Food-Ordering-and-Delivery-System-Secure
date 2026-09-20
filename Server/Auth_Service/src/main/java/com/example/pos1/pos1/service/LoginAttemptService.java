package com.example.pos1.pos1.service;

import com.example.pos1.pos1.entity.ApplicationUser;
import com.example.pos1.pos1.repo.ApplicationUserRepo;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Brute-force protection for the login endpoint.
 *
 * Fix for V-AuthWeakness Test 4 (No lockout): the original application applied
 * no account lockout, rate limiting, delay or CAPTCHA, so an attacker could try
 * unlimited passwords. This service tracks consecutive failed logins per user
 * and locks the account for a cooling-off window once the threshold is reached.
 *
 * The lock itself is enforced by Spring Security: once {@code isAccountNonLocked}
 * is set to {@code false} on the user, {@code DaoAuthenticationProvider} rejects
 * every authentication attempt (even with the correct password) by throwing a
 * {@link org.springframework.security.authentication.LockedException}.
 */
@Service
public class LoginAttemptService {

    /** Lock the account after this many consecutive failures. */
    public static final int MAX_FAILED_ATTEMPTS = 5;

    /** How long the account stays locked before it is automatically unlocked. */
    public static final long LOCK_TIME_MINUTES = 15;

    private final ApplicationUserRepo userRepository;

    public LoginAttemptService(ApplicationUserRepo userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Record a failed login attempt for the given username. When the number of
     * consecutive failures reaches {@link #MAX_FAILED_ATTEMPTS}, the account is
     * locked and the lock timestamp is stored.
     */
    public void loginFailed(String username) {
        Optional<ApplicationUser> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            // Unknown username: nothing to track. (Avoids user enumeration side effects.)
            return;
        }
        ApplicationUser user = optional.get();
        if (!user.isAccountNonLocked()) {
            // Already locked; no further counting needed.
            return;
        }
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);
        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setAccountNonLocked(false);
            user.setLockTime(LocalDateTime.now());
        }
        userRepository.save(user);
    }

    /**
     * Reset the failure counter after a successful login and ensure the account
     * is unlocked.
     */
    public void loginSucceeded(String username) {
        Optional<ApplicationUser> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return;
        }
        ApplicationUser user = optional.get();
        if (user.getFailedAttempts() != 0 || !user.isAccountNonLocked() || user.getLockTime() != null) {
            user.setFailedAttempts(0);
            user.setAccountNonLocked(true);
            user.setLockTime(null);
            userRepository.save(user);
        }
    }

    /**
     * @return how many more failed attempts are allowed before the account is
     * locked (never negative). Used to tell the user "N attempts remaining".
     */
    public int getRemainingAttempts(String username) {
        Optional<ApplicationUser> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return MAX_FAILED_ATTEMPTS;
        }
        return Math.max(MAX_FAILED_ATTEMPTS - optional.get().getFailedAttempts(), 0);
    }

    /**
     * @return the number of whole minutes remaining until a locked account is
     * automatically unlocked (rounded up; at least 1 while any time remains,
     * 0 if not locked).
     */
    public long getMinutesUntilUnlock(String username) {
        Optional<ApplicationUser> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return 0;
        }
        ApplicationUser user = optional.get();
        if (user.getLockTime() == null) {
            return 0;
        }
        LocalDateTime unlockAt = user.getLockTime().plusMinutes(LOCK_TIME_MINUTES);
        long seconds = Duration.between(LocalDateTime.now(), unlockAt).getSeconds();
        if (seconds <= 0) {
            return 0;
        }
        return (seconds + 59) / 60; // round up to the next whole minute
    }

    /**
     * @return {@code true} if the account is currently locked. If the lock window
     * has already elapsed, the account is automatically unlocked and {@code false}
     * is returned.
     */
    public boolean isLocked(String username) {
        Optional<ApplicationUser> optional = userRepository.findByUsername(username);
        if (optional.isEmpty()) {
            return false;
        }
        ApplicationUser user = optional.get();
        if (user.isAccountNonLocked()) {
            return false;
        }
        // Account is locked: auto-unlock if the cooling-off window has passed.
        if (user.getLockTime() != null
                && user.getLockTime().plusMinutes(LOCK_TIME_MINUTES).isBefore(LocalDateTime.now())) {
            user.setAccountNonLocked(true);
            user.setFailedAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
            return false;
        }
        return true;
    }
}
