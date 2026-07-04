package com.ah.web.controller;

import com.ah.web.dto.request.UpdateProfileRequest;
import com.ah.web.dto.response.UserResponse;
import com.ah.web.entity.User;
import com.ah.web.exception.UnauthorizedException;
import com.ah.web.repository.UserRepository;
import com.ah.web.security.JwtService;
import com.ah.web.service.UserService;
import com.ah.web.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CookieUtil cookieUtil;

    public UserController(UserService userService, JwtService jwtService, UserRepository userRepository, CookieUtil cookieUtil) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.cookieUtil = cookieUtil;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(HttpServletRequest request, Authentication authentication) {
        User currentUser = resolveCurrentUser(request, authentication);
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            HttpServletRequest request,
            Authentication authentication,
            @RequestBody UpdateProfileRequest requestBody) {
        User currentUser = resolveCurrentUser(request, authentication);
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), requestBody));
    }

    private User resolveCurrentUser(HttpServletRequest request, Authentication authentication) {
        if (authentication != null) {
            User authenticatedUser = resolveUserFromAuthentication(authentication);
            if (authenticatedUser != null) {
                return authenticatedUser;
            }
        }

        String token = resolveToken(request);
        if (!StringUtils.hasText(token)) {
            return null;
        }

        try {
            if (!jwtService.validateToken(token) || !jwtService.isAccessToken(token)) {
                return null;
            }

            String email = jwtService.getEmailFromToken(token);
            if (!StringUtils.hasText(email)) {
                return null;
            }

            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    private User resolveUserFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (StringUtils.hasText(email)) {
                return userRepository.findByEmail(email).orElse(null);
            }
        }

        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            if (StringUtils.hasText(username)) {
                return userRepository.findByEmail(username).orElse(null);
            }
        }

        if (StringUtils.hasText(authentication.getName())) {
            return userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        return null;
    }

    private String resolveToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return cookieUtil.getCookie(request, "accessToken");
    }
}
