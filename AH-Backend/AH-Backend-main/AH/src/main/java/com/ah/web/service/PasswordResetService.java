package com.ah.web.service;
import com.ah.web.exception.BadRequestException;
import com.ah.web.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
@Service
public class PasswordResetService {
    private final JdbcTemplate db;
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder encoder;
    private final JavaMailSender mail;
    private final String frontend, from;
    public PasswordResetService(JdbcTemplate db, UserRepository users, RefreshTokenRepository refreshTokens, PasswordEncoder encoder,
        JavaMailSender mail, @Value("${app.frontend-url:http://localhost:5173}") String frontend, @Value("${spring.mail.username:}") String from) {
        this.db=db; this.users=users; this.refreshTokens=refreshTokens; this.encoder=encoder; this.mail=mail; this.frontend=frontend; this.from=from;
    }
    @Transactional
    public void request(String email) {
        if (from.isBlank()) throw new BadRequestException("Password recovery email is unavailable. Please contact support.");
        var found=users.findByEmail(email.trim().toLowerCase(Locale.ROOT));
        if (found.isEmpty()) return;
        var user=users.lockById(found.get().getId()).orElseThrow();
        byte[] bytes=new byte[32]; new SecureRandom().nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        db.update("DELETE FROM password_reset_tokens WHERE user_id=? OR expires_at < ?",user.getId(), java.sql.Timestamp.from(Instant.now()));
        db.update("INSERT INTO password_reset_tokens(token_hash,user_id,expires_at) VALUES (?,?,?)", hash(token),user.getId(),java.sql.Timestamp.from(Instant.now().plusSeconds(1800)));
        SimpleMailMessage message=new SimpleMailMessage(); message.setFrom(from); message.setTo(user.getEmail());
        message.setSubject("Reset your Anjaneya Herbals password");
        message.setText("Use this one-time link within 30 minutes: " + frontend + "/reset-password#token=" + token + "\nIf you did not request this, ignore this email.");
        mail.send(message);
    }
    @Transactional
    public void reset(String token,String password) {
        var rows=db.queryForList("SELECT user_id,expires_at FROM password_reset_tokens WHERE token_hash=? FOR UPDATE",hash(token));
        if(rows.isEmpty()) throw new BadRequestException("Reset link is invalid or expired");
        var row=rows.getFirst();
        if(((java.sql.Timestamp)row.get("expires_at")).toInstant().isBefore(Instant.now())) throw new BadRequestException("Reset link is invalid or expired");
        Long userId=((Number)row.get("user_id")).longValue();
        var user=users.lockById(userId).orElseThrow();
        user.setPassword(encoder.encode(password)); user.setAuthVersion(user.getAuthVersion()+1); users.save(user);
        refreshTokens.deleteByUserId(userId);
        db.update("DELETE FROM password_reset_tokens WHERE user_id=?",userId);
    }
    private String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch(NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
