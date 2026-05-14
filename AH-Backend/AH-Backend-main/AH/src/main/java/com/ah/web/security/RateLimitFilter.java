package com.ah.web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L; // 1-minute sliding window

    private record EndpointLimit(String pathSuffix, int maxRequests) {}

    private static final EndpointLimit[] LIMITS = {
        new EndpointLimit("/api/auth/login",    5),
        new EndpointLimit("/api/auth/register", 3),
        new EndpointLimit("/api/chat",          20), // 20 AI chat messages/min per IP
    };

    // key: "IP::endpoint" → timestamps of recent requests
    private final Map<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip   = resolveClientIp(request);

        for (EndpointLimit limit : LIMITS) {
            if (path.endsWith(limit.pathSuffix()) && "POST".equalsIgnoreCase(request.getMethod())) {
                String key = ip + "::" + limit.pathSuffix();
                if (isRateLimited(key, limit.maxRequests())) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                        "{\"message\":\"Too many requests. Please try again later.\"}");
                    return;
                }
                break;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean isRateLimited(String key, int maxRequests) {
        long now = Instant.now().toEpochMilli();
        long windowStart = now - WINDOW_MS;

        Deque<Long> timestamps = requestLog.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            // Evict timestamps outside the window
            while (!timestamps.isEmpty() && timestamps.peekFirst() < windowStart) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= maxRequests) {
                return true;
            }
            timestamps.addLast(now);
            return false;
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
