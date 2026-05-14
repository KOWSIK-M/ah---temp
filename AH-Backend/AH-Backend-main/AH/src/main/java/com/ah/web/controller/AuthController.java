package com.ah.web.controller;

import com.ah.web.dto.request.LoginRequest;
import com.ah.web.dto.request.RefreshTokenRequest;
import com.ah.web.dto.request.RegisterRequest;
import com.ah.web.dto.response.AuthResponse;
import com.ah.web.dto.response.MessageResponse;
import com.ah.web.service.AuthService;
import com.ah.web.util.CookieUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    public AuthController(AuthService authService, CookieUtil cookieUtil) {
        this.authService = authService;
        this.cookieUtil = cookieUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        cookieUtil.createAccessTokenCookie(response, authResponse.getAccessToken());
        cookieUtil.createRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        cookieUtil.createAccessTokenCookie(response, authResponse.getAccessToken());
        cookieUtil.createRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getCookie(request, "refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }
        
        RefreshTokenRequest tokenRequest = new RefreshTokenRequest();
        tokenRequest.setRefreshToken(refreshToken);
        
        AuthResponse authResponse = authService.refreshToken(tokenRequest);
        cookieUtil.createAccessTokenCookie(response, authResponse.getAccessToken());
        cookieUtil.createRefreshTokenCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(jakarta.servlet.http.HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getCookie(request, "refreshToken");
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        cookieUtil.deleteCookie(response, "accessToken");
        cookieUtil.deleteCookie(response, "refreshToken");
        return ResponseEntity.ok(MessageResponse.of("Logged out successfully"));
    }
}
