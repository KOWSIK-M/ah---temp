package com.ah.web.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** The single pricing policy used for quotes and persisted orders. Amounts are INR. */
public final class CheckoutPricing {
    private CheckoutPricing() {}
    public record Quote(BigDecimal subtotal, BigDecimal discount, BigDecimal shippingCharges,
                        BigDecimal codCharges, BigDecimal totalAmount) {}
    public static Quote calculate(BigDecimal subtotal, BigDecimal discount, String method) {
        if (subtotal.signum() < 0 || discount.signum() < 0 || discount.compareTo(subtotal) > 0)
            throw new IllegalArgumentException("Invalid checkout amounts");
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("999")) > 0 ? BigDecimal.ZERO : new BigDecimal("49");
        BigDecimal cod = "COD".equalsIgnoreCase(method) ? new BigDecimal("29") : BigDecimal.ZERO;
        return new Quote(subtotal, discount, shipping, cod,
                subtotal.subtract(discount).add(shipping).add(cod).setScale(2, RoundingMode.HALF_UP));
    }
}
