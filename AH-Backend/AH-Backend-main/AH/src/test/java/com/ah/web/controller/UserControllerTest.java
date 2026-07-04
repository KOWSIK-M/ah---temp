package com.ah.web.controller;

import com.ah.web.dto.response.UserResponse;
import com.ah.web.entity.User;
import com.ah.web.repository.UserRepository;
import com.ah.web.security.JwtService;
import com.ah.web.service.UserService;
import com.ah.web.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserControllerTest {

    @Test
    void getCurrentUserUsesOauth2UserPrincipalWhenPresent() {
        UserService userService = mock(UserService.class);
        JwtService jwtService = mock(JwtService.class);
        UserRepository userRepository = mock(UserRepository.class);
        CookieUtil cookieUtil = mock(CookieUtil.class);

        UserController controller = new UserController(userService, jwtService, userRepository, cookieUtil);

        User persistedUser = User.builder()
                .id(42L)
                .email("oauth@example.com")
                .firstName("OAuth")
                .lastName("User")
                .password("")
                .build();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", "oauth@example.com"),
                "email"
        );

        Authentication authentication = new TestingAuthenticationToken(oauth2User, null, "ROLE_USER");

        when(userRepository.findByEmail("oauth@example.com")).thenReturn(Optional.of(persistedUser));
        when(userService.getUserById(42L)).thenReturn(UserResponse.builder()
                .id(42L)
                .email("oauth@example.com")
                .firstName("OAuth")
                .lastName("User")
                .role("CUSTOMER")
                .build());

        ResponseEntity<UserResponse> response = controller.getCurrentUser(mock(HttpServletRequest.class), authentication);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("oauth@example.com");
        verify(userRepository).findByEmail("oauth@example.com");
    }
}
