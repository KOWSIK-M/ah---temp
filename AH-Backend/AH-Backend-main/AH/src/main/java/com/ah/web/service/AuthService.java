package com.ah.web.service;

import com.ah.web.dto.request.LoginRequest;
import com.ah.web.dto.request.RefreshTokenRequest;
import com.ah.web.dto.request.RegisterRequest;
import com.ah.web.dto.response.AuthResponse;
import com.ah.web.dto.response.UserResponse;
import com.ah.web.entity.Cart;
import com.ah.web.entity.RefreshToken;
import com.ah.web.entity.User;
import com.ah.web.exception.BadRequestException;
import com.ah.web.exception.UnauthorizedException;
import com.ah.web.repository.CartRepository;
import com.ah.web.repository.RefreshTokenRepository;
import com.ah.web.repository.UserRepository;
import com.ah.web.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.ah.web.entity.Role;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, 
                       RefreshTokenRepository refreshTokenRepository, 
                       CartRepository cartRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtService jwtService, 
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .build();

        user = userRepository.save(user);

        // Create cart for new user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        return tokenService.generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new UnauthorizedException("Invalid credentials");
    }

    return tokenService.generateAuthResponse(user);
}


    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }

        User user = refreshToken.getUser();
        
        // Delete old refresh token
        refreshTokenRepository.delete(refreshToken);
        
        return tokenService.generateAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    @Transactional
    public AuthResponse processOAuth2Login(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new BadRequestException("Email not found from OAuth2 provider");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> registerNewOAuth2User(oAuth2User));

        return tokenService.generateAuthResponse(user);
    }

    private User registerNewOAuth2User(OAuth2User oAuth2User) {
        String name = oAuth2User.getAttribute("name");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        if (firstName == null && name != null) {
            String[] parts = name.split(" ", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        User user = User.builder()
                .email(oAuth2User.getAttribute("email"))
                .firstName(firstName != null ? firstName : "User")
                .lastName(lastName != null ? lastName : "")
                .role(Role.CUSTOMER)
                .password("") // Empty password for OAuth users
                .build();

        user = userRepository.save(user);

        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        return user;
    }
}
