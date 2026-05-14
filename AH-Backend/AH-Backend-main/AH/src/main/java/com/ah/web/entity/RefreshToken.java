package com.ah.web.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    // Default constructor
    public RefreshToken() {}

    // All-args constructor
    public RefreshToken(Long id, String token, User user, Instant expiryDate) {
        this.id = id;
        this.token = token;
        this.user = user;
        this.expiryDate = expiryDate;
    }

    // Getters
    public Long getId() { return id; }
    public String getToken() { return token; }
    public User getUser() { return user; }
    public Instant getExpiryDate() { return expiryDate; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setToken(String token) { this.token = token; }
    public void setUser(User user) { this.user = user; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }

    // Helper method
    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }

    // Builder
    public static RefreshTokenBuilder builder() { return new RefreshTokenBuilder(); }

    public static class RefreshTokenBuilder {
        private Long id;
        private String token;
        private User user;
        private Instant expiryDate;

        public RefreshTokenBuilder id(Long id) { this.id = id; return this; }
        public RefreshTokenBuilder token(String token) { this.token = token; return this; }
        public RefreshTokenBuilder user(User user) { this.user = user; return this; }
        public RefreshTokenBuilder expiryDate(Instant expiryDate) { this.expiryDate = expiryDate; return this; }

        public RefreshToken build() {
            return new RefreshToken(id, token, user, expiryDate);
        }
    }
}
