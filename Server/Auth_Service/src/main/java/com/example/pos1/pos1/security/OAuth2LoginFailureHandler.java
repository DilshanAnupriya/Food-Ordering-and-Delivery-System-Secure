package com.example.pos1.pos1.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final String frontendLoginUri;
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    public OAuth2LoginFailureHandler(@Value("${application.oauth2.frontendLoginUri}") String frontendLoginUri) {
        this.frontendLoginUri = frontendLoginUri;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        // Only the standard OAuth2 error code goes in the URL, never exception details.
        String errorCode = exception instanceof OAuth2AuthenticationException oauth2Exception
                ? oauth2Exception.getError().getErrorCode()
                : "oauth2_login_failed";
        redirectStrategy.sendRedirect(request, response,
                frontendLoginUri + "?oauthError=" + URLEncoder.encode(errorCode, StandardCharsets.UTF_8));
    }
}
