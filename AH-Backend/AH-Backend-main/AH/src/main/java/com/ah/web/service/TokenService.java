package com.ah.web.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ah.web.dto.response.AuthResponse;
import com.ah.web.dto.response.UserResponse;
import com.ah.web.entity.RefreshToken;
import com.ah.web.entity.User;
import com.ah.web.repository.RefreshTokenRepository;
import com.ah.web.security.JwtService;

@Service
public class TokenService {

    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    public TokenService(JwtService jwtService, RefreshTokenRepository refreshTokenRepository) {
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtService.getRefreshTokenExpiration()))
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthResponse.of(
                accessToken,
                refreshTokenValue,
                jwtService.getRefreshTokenExpiration() / 1000,
                UserResponse.fromEntity(user)
        );
    }
}

