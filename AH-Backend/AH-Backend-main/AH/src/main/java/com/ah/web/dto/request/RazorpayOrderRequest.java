package com.ah.web.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RazorpayOrderRequest {
    /** Amount in paise (1 INR = 100 paise). Minimum 100 paise = ₹1. */
    @NotNull
    @Min(100)
    private Long amountInPaise;

    public RazorpayOrderRequest() {}
    public Long getAmountInPaise() { return amountInPaise; }
    public void setAmountInPaise(Long amountInPaise) { this.amountInPaise = amountInPaise; }
}
