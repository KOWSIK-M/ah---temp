package com.ah.web.service;

import java.math.BigDecimal;

public interface PaymentGateway {
    record Payment(String id, String orderId, long amount, String currency, String status) {}
    String createOrder(Long orderId, BigDecimal amount);
    String keyId();
    java.util.List<Payment> paymentsForOrder(String gatewayOrderId);
    boolean verifySignature(String payload, String signature, boolean webhook);
    Payment fetchPayment(String id);
    /** Return gateway refund state; never label a pending refund as completed. */
    boolean isFullyRefunded(String paymentId, BigDecimal amount);
    String refund(String paymentId, Long orderId, BigDecimal amount);
}
