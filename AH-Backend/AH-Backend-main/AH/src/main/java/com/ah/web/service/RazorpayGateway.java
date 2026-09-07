package com.ah.web.service;

import com.ah.web.exception.BadRequestException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class RazorpayGateway implements PaymentGateway {
    private final RestClient client;
    private final String keyId, secret, webhookSecret;
    public RazorpayGateway(@Value("${razorpay.key.id:}") String keyId,
                           @Value("${razorpay.key.secret:}") String secret,
                           @Value("${razorpay.webhook-secret:}") String webhookSecret) {
        this.keyId = keyId; this.secret = secret; this.webhookSecret = webhookSecret;
        var factory = new org.springframework.http.client.JdkClientHttpRequestFactory();
        factory.setReadTimeout(java.time.Duration.ofSeconds(15));
        client = RestClient.builder().baseUrl("https://api.razorpay.com/v1")
                .requestFactory(factory).defaultHeaders(h -> h.setBasicAuth(keyId, secret)).build();
    }
    public String keyId() { return keyId; }
    private JSONObject get(String path) {
        return new JSONObject(client.get().uri(path).retrieve().body(String.class));
    }
    public String createOrder(Long id, BigDecimal amount) {
        if (keyId.isBlank() || secret.isBlank()) throw new BadRequestException("Online payments are not configured. Please choose COD.");
        String response = client.post().uri("/orders").contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(java.util.Map.of("amount", amount.movePointRight(2).longValueExact(), "currency", "INR", "receipt", "ah_" + id))
                .retrieve().body(String.class);
        return new JSONObject(response).getString("id");
    }
    public boolean verifySignature(String payload, String signature, boolean webhook) {
        String signingSecret = webhook ? webhookSecret : secret;
        if (signingSecret.isBlank() || signature == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return MessageDigest.isEqual(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)), HexFormat.of().parseHex(signature));
        } catch (Exception e) { return false; }
    }
    public Payment fetchPayment(String id) {
        if (id == null || !id.matches("pay_[A-Za-z0-9]+")) throw new BadRequestException("Invalid payment reference");
        JSONObject p = get("/payments/" + id);
        return new Payment(p.getString("id"), p.optString("order_id"), p.getLong("amount"), p.getString("currency"), p.getString("status"));
    }
    public java.util.List<Payment> paymentsForOrder(String orderId) {
        if (!orderId.matches("order_[A-Za-z0-9]+")) throw new BadRequestException("Invalid checkout reference");
        var items=get("/orders/"+orderId+"/payments").getJSONArray("items");
        java.util.List<Payment> payments=new java.util.ArrayList<>();
        for(int i=0;i<items.length();i++) {
            var p=items.getJSONObject(i);
            payments.add(new Payment(p.getString("id"),p.optString("order_id"),p.getLong("amount"),p.getString("currency"),p.getString("status")));
        }
        return payments;
    }
    public boolean isFullyRefunded(String paymentId, BigDecimal amount) {
        return get("/payments/"+paymentId).optLong("amount_refunded") >= amount.movePointRight(2).longValueExact();
    }
    public String refund(String paymentId, Long orderId, BigDecimal amount) {
        // Reconcile previously accepted requests first, including after a timeout or DB rollback.
        JSONObject payment = get("/payments/" + paymentId);
        long paise = amount.movePointRight(2).longValueExact();
        if (payment.optLong("amount_refunded") >= paise) return "REFUNDED";
        var refunds = get("/payments/" + paymentId + "/refunds").getJSONArray("items");
        for (int i = 0; i < refunds.length(); i++) {
            JSONObject refund = refunds.getJSONObject(i);
            if (!"failed".equals(refund.optString("status"))) return "REFUND_PENDING";
        }
        JSONObject refund = new JSONObject(client.post().uri("/payments/" + paymentId + "/refund")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(java.util.Map.of("amount", paise, "receipt", "ah_refund_" + orderId))
                .retrieve().body(String.class));
        return "processed".equals(refund.optString("status")) ? "REFUNDED" : "REFUND_PENDING";
    }
}
