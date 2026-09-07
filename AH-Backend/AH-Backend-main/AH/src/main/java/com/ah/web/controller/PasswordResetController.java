package com.ah.web.controller;
import com.ah.web.service.PasswordResetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {
    private final PasswordResetService service;
    public PasswordResetController(PasswordResetService service) { this.service=service; }
    public record Forgot(@Email @NotBlank @Size(max=254) String email) {}
    public record Reset(@NotBlank @Size(max=100) String token, @NotBlank @Size(min=8,max=72) String password) {}
    @PostMapping("/forgot-password") public Map<String,String> forgot(@Valid @RequestBody Forgot request) {
        service.request(request.email()); return Map.of("message","If an account exists, a reset link has been emailed.");
    }
    @PostMapping("/reset-password") public Map<String,String> reset(@Valid @RequestBody Reset request) {
        service.reset(request.token(),request.password()); return Map.of("message","Password updated. Please sign in again.");
    }
}
