package com.ah.web.dto.response;

import com.ah.web.entity.Coupon;

import java.math.BigDecimal;

public class CouponValidationResponse {

    private boolean valid;
    private String message;
    private String couponCode;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;   // actual rupee discount applied
    private BigDecimal originalAmount;
    private BigDecimal finalAmount;

    public CouponValidationResponse() {}

    /** Factory for a successful validation. */
    public static CouponValidationResponse success(Coupon coupon,
                                                    BigDecimal orderAmount,
                                                    BigDecimal discountAmount) {
        CouponValidationResponse r = new CouponValidationResponse();
        r.valid           = true;
        r.message         = "Coupon applied successfully";
        r.couponCode      = coupon.getCode();
        r.discountType    = coupon.getDiscountType().name();
        r.discountValue   = coupon.getDiscountValue();
        r.discountAmount  = discountAmount;
        r.originalAmount  = orderAmount;
        r.finalAmount     = orderAmount.subtract(discountAmount);
        return r;
    }

    /** Factory for a failed validation. */
    public static CouponValidationResponse failure(String message) {
        CouponValidationResponse r = new CouponValidationResponse();
        r.valid   = false;
        r.message = message;
        return r;
    }

    // Getters
    public boolean isValid()               { return valid; }
    public String getMessage()             { return message; }
    public String getCouponCode()          { return couponCode; }
    public String getDiscountType()        { return discountType; }
    public BigDecimal getDiscountValue()   { return discountValue; }
    public BigDecimal getDiscountAmount()  { return discountAmount; }
    public BigDecimal getOriginalAmount()  { return originalAmount; }
    public BigDecimal getFinalAmount()     { return finalAmount; }

    // Setters (for Jackson)
    public void setValid(boolean valid)                      { this.valid = valid; }
    public void setMessage(String message)                   { this.message = message; }
    public void setCouponCode(String couponCode)             { this.couponCode = couponCode; }
    public void setDiscountType(String discountType)         { this.discountType = discountType; }
    public void setDiscountValue(BigDecimal discountValue)   { this.discountValue = discountValue; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public void setOriginalAmount(BigDecimal originalAmount) { this.originalAmount = originalAmount; }
    public void setFinalAmount(BigDecimal finalAmount)       { this.finalAmount = finalAmount; }
}
