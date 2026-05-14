package com.ah.web.dto.request;

import com.ah.web.entity.Coupon.DiscountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponRequest {

    @NotBlank(message = "Code is required")
    @Size(max = 50, message = "Code must be at most 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Code must contain only uppercase letters, digits, hyphens, or underscores")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be positive")
    private BigDecimal discountValue;

    @DecimalMin(value = "0.00", message = "Min order amount cannot be negative")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** For PERCENTAGE coupons: max rupee discount allowed. Null = no cap. */
    @DecimalMin(value = "0.01", message = "Max discount amount must be positive")
    private BigDecimal maxDiscountAmount;

    /** Total allowed redemptions. Null = unlimited. */
    @Min(value = 1, message = "Max uses must be at least 1")
    private Integer maxUses;

    private Boolean active = true;

    private LocalDateTime expiresAt;

    public CouponRequest() {}

    // Getters
    public String getCode()                      { return code; }
    public String getDescription()               { return description; }
    public DiscountType getDiscountType()         { return discountType; }
    public BigDecimal getDiscountValue()          { return discountValue; }
    public BigDecimal getMinOrderAmount()         { return minOrderAmount; }
    public BigDecimal getMaxDiscountAmount()      { return maxDiscountAmount; }
    public Integer getMaxUses()                   { return maxUses; }
    public Boolean getActive()                    { return active; }
    public LocalDateTime getExpiresAt()           { return expiresAt; }

    // Setters
    public void setCode(String code)                              { this.code = code; }
    public void setDescription(String description)                { this.description = description; }
    public void setDiscountType(DiscountType discountType)        { this.discountType = discountType; }
    public void setDiscountValue(BigDecimal discountValue)        { this.discountValue = discountValue; }
    public void setMinOrderAmount(BigDecimal minOrderAmount)      { this.minOrderAmount = minOrderAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount){ this.maxDiscountAmount = maxDiscountAmount; }
    public void setMaxUses(Integer maxUses)                       { this.maxUses = maxUses; }
    public void setActive(Boolean active)                         { this.active = active; }
    public void setExpiresAt(LocalDateTime expiresAt)             { this.expiresAt = expiresAt; }
}
