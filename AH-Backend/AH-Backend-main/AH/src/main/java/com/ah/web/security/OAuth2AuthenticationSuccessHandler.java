package com.ah.web.security;

import com.ah.web.dto.response.AuthResponse;
import com.ah.web.entity.Cart;
import com.ah.web.entity.Role;
import com.ah.web.entity.User;
import com.ah.web.repository.CartRepository;
import com.ah.web.repository.UserRepository;
import com.ah.web.service.TokenService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final com.ah.web.service.AuthService authService;
    private final com.ah.web.util.CookieUtil cookieUtil;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Value("${APP_OAUTH2_REDIRECT_URI:http://localhost:5173/oauth2/redirect}")
    private String envRedirectUri;

    public OAuth2AuthenticationSuccessHandler(com.ah.web.service.AuthService authService,
                                              com.ah.web.util.CookieUtil cookieUtil) {
        this.authService = authService;
        this.cookieUtil = cookieUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        try {
            System.out.println("OAuth2 Login Success - Processing User via AuthService");
            System.out.println("DEBUG: Configured redirectUri: " + redirectUri);
            
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // Delegate to transactional AuthService
            AuthResponse authResponse = authService.processOAuth2Login(oAuth2User);

            // Set cookies
            cookieUtil.createAccessTokenCookie(response, authResponse.getAccessToken());
            cookieUtil.createRefreshTokenCookie(response, authResponse.getRefreshToken());

            // Select the most specific redirect URI
            String targetUrl = envRedirectUri != null && envRedirectUri.startsWith("http") ? envRedirectUri : redirectUri;
            
            System.out.println("DEBUG: Final targetUrl to redirect: " + targetUrl);
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            System.err.println("FATAL ERROR in OAuth2 Success Handler: " + e.getMessage());
            e.printStackTrace();
            
            String targetUrl = envRedirectUri != null && envRedirectUri.startsWith("http") ? envRedirectUri : redirectUri;
            
            // Redirect to frontend with error message
            String errorUrl = UriComponentsBuilder.fromUriString(targetUrl)
                    .queryParam("error", "Login failed: " + e.getMessage())
                    .build().toUriString();
            System.out.println("DEBUG: Error redirecting to: " + errorUrl);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}
