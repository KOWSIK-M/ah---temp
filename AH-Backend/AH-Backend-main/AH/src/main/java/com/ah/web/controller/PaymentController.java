package com.ah.web.controller;
import com.ah.web.dto.request.VerifyPaymentRequest;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.entity.User;
import com.ah.web.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/payment")
public class PaymentController {
    private final PaymentService payments;
    public PaymentController(PaymentService payments) { this.payments = payments; }
    @PostMapping("/razorpay/create-order")
    public Map<String, Object> create(@AuthenticationPrincipal User user, @RequestBody PaymentService.StartRequest request) {
        return payments.start(user.getId(), request);
    }
    @PostMapping("/razorpay/verify")
    public OrderResponse verify(@AuthenticationPrincipal User user, @Valid @RequestBody VerifyPaymentRequest request) {
        return payments.verify(user.getId(), request);
    }
    @PostMapping("/razorpay/webhook")
    public Map<String, Boolean> webhook(@RequestBody String body, @RequestHeader("X-Razorpay-Signature") String signature) {
        payments.webhook(body, signature); return Map.of("received", true);
    }
}
