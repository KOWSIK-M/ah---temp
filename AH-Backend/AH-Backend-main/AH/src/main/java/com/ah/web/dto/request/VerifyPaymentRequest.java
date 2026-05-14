package com.ah.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VerifyPaymentRequest {
    @NotBlank private String razorpayOrderId;
    @NotBlank private String razorpayPaymentId;
    @NotBlank private String razorpaySignature;
    @NotNull  private Long   shippingAddressId;
    private String couponCode;

    public VerifyPaymentRequest() {}

    public String getRazorpayOrderId()    { return razorpayOrderId; }
    public String getRazorpayPaymentId()  { return razorpayPaymentId; }
    public String getRazorpaySignature()  { return razorpaySignature; }
    public Long   getShippingAddressId()  { return shippingAddressId; }
    public String getCouponCode()         { return couponCode; }

    public void setRazorpayOrderId(String razorpayOrderId)     { this.razorpayOrderId = razorpayOrderId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    public void setShippingAddressId(Long shippingAddressId)   { this.shippingAddressId = shippingAddressId; }
    public void setCouponCode(String couponCode)               { this.couponCode = couponCode; }
}
