package com.ah.web.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${jwt.access-expiration:7200000}")
    private long accessTokenExpiration; // in milliseconds - 2 hours default

    @Value("${jwt.refresh-expiration:2592000000}")
    private long refreshTokenExpiration; // in milliseconds - 30 days default

    @Value("${cookie.secure:false}")
    private boolean secureCookie; // Set to true in production with HTTPS

    // Get appropriate SameSite value based on secure flag
    // SameSite=None requires Secure=true (HTTPS)
    // For development (HTTP), use Lax
    private String getSameSiteValue() {
        return secureCookie ? "None" : "Lax";
    }

    public void createAccessTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(accessTokenExpiration / 1000)
                .sameSite(getSameSiteValue())
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void createRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(refreshTokenExpiration / 1000)
                .sameSite(getSameSiteValue())
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void deleteCookie(HttpServletResponse response, String name) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(0)
                .sameSite(getSameSiteValue())
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public String getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
