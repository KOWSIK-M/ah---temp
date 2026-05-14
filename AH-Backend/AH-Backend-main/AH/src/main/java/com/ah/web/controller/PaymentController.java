package com.ah.web.controller;

import com.ah.web.dto.request.CreateOrderRequest;
import com.ah.web.dto.request.RazorpayOrderRequest;
import com.ah.web.dto.request.VerifyPaymentRequest;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.entity.User;
import com.ah.web.service.OrderService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final OrderService orderService;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * POST /api/payment/razorpay/create-order
     * Creates a Razorpay order so the frontend can open the Razorpay checkout.
     * Returns { razorpayOrderId, amount (paise), currency, keyId }.
     */
    @PostMapping("/razorpay/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @Valid @RequestBody RazorpayOrderRequest request) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject orderReq = new JSONObject();
            orderReq.put("amount",   request.getAmountInPaise());
            orderReq.put("currency", "INR");
            orderReq.put("receipt",  "rcpt_" + System.currentTimeMillis());
            orderReq.put("payment_capture", 1);

            com.razorpay.Order rzpOrder = client.orders.create(orderReq);

            return ResponseEntity.ok(Map.of(
                    "razorpayOrderId", rzpOrder.get("id").toString(),
                    "amount",          rzpOrder.get("amount").toString(),
                    "currency",        rzpOrder.get("currency").toString(),
                    "keyId",           keyId
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Payment gateway error: " + e.getMessage()));
        }
    }

    /**
     * POST /api/payment/razorpay/verify
     * Verifies Razorpay payment signature, then creates the order in the DB.
     * The order is marked CONFIRMED + paymentStatus=PAID immediately.
     */
    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody VerifyPaymentRequest request) {

        // Verify HMAC-SHA256 signature
        // Razorpay spec: signature = HMAC_SHA256(orderId + "|" + paymentId, secret)
        try {
            String payload   = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
            String computed  = hmacSha256(payload, keySecret);
            if (!computed.equals(request.getRazorpaySignature())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Payment signature verification failed"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Signature verification error"));
        }

        // Create the order in our DB (marks it CONFIRMED + PAID)
        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setShippingAddressId(request.getShippingAddressId());
        orderReq.setPaymentMethod("RAZORPAY");
        orderReq.setCouponCode(request.getCouponCode());
        orderReq.setRazorpayPaymentId(request.getRazorpayPaymentId());

        try {
            OrderResponse orderResponse = orderService.createOrder(user.getId(), orderReq);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ── helpers ──────────────────────────────────────────────────────

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes("UTF-8"));
        StringBuilder hex = new StringBuilder(hash.length * 2);
        for (byte b : hash) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
