package com.ah.web.controller;
import com.ah.web.dto.response.ProductResponse;
import com.ah.web.entity.User;
import com.ah.web.service.CustomerFeaturesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api")
public class CustomerFeaturesController {
    private final CustomerFeaturesService service;
    public CustomerFeaturesController(CustomerFeaturesService service) { this.service = service; }
    public record Subscription(@Email @NotBlank @Size(max=254) String email, @AssertTrue boolean consent) {}
    @GetMapping("/wishlist") public List<ProductResponse> get(@AuthenticationPrincipal User user) { return service.wishlist(user.getId()); }
    @PutMapping("/wishlist/{id}") public void add(@AuthenticationPrincipal User user, @PathVariable Long id) { service.add(user.getId(),id); }
    @DeleteMapping("/wishlist/{id}") public void remove(@AuthenticationPrincipal User user, @PathVariable Long id) { service.remove(user.getId(),id); }
    @PostMapping("/newsletter") public Map<String,String> subscribe(@Valid @RequestBody Subscription request) {
        service.subscribe(request.email()); return Map.of("message", "Your subscription has been saved.");
    }
}
