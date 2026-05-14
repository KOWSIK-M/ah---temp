package com.ah.web.dto.request;

import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {
    
    @NotNull(message = "Shipping address ID is required")
    private Long shippingAddressId;
    
    private String paymentMethod;

    /** Optional — validated server-side; invalid code causes order rejection. */
    private String couponCode;

    /** Optional — Razorpay payment ID; when present, order is marked CONFIRMED + PAID. */
    private String razorpayPaymentId;

    public CreateOrderRequest() {}

    public CreateOrderRequest(Long shippingAddressId, String paymentMethod, String couponCode) {
        this.shippingAddressId = shippingAddressId;
        this.paymentMethod = paymentMethod;
        this.couponCode = couponCode;
    }

    public Long getShippingAddressId() { return shippingAddressId; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getCouponCode() { return couponCode; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }

    public void setShippingAddressId(Long shippingAddressId) { this.shippingAddressId = shippingAddressId; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
}
