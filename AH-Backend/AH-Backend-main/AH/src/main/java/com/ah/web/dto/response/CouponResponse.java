package com.ah.web.dto.response;

import com.ah.web.entity.Coupon;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer maxUses;
    private Integer usedCount;
    private Boolean active;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CouponResponse() {}

    public static CouponResponse fromEntity(Coupon c) {
        CouponResponse r = new CouponResponse();
        r.id                 = c.getId();
        r.code               = c.getCode();
        r.description        = c.getDescription();
        r.discountType       = c.getDiscountType().name();
        r.discountValue      = c.getDiscountValue();
        r.minOrderAmount     = c.getMinOrderAmount();
        r.maxDiscountAmount  = c.getMaxDiscountAmount();
        r.maxUses            = c.getMaxUses();
        r.usedCount          = c.getUsedCount();
        r.active             = c.getActive();
        r.expiresAt          = c.getExpiresAt();
        r.createdAt          = c.getCreatedAt();
        r.updatedAt          = c.getUpdatedAt();
        return r;
    }

    // Getters
    public Long getId()                      { return id; }
    public String getCode()                  { return code; }
    public String getDescription()           { return description; }
    public String getDiscountType()          { return discountType; }
    public BigDecimal getDiscountValue()     { return discountValue; }
    public BigDecimal getMinOrderAmount()    { return minOrderAmount; }
    public BigDecimal getMaxDiscountAmount() { return maxDiscountAmount; }
    public Integer getMaxUses()              { return maxUses; }
    public Integer getUsedCount()            { return usedCount; }
    public Boolean getActive()               { return active; }
    public LocalDateTime getExpiresAt()      { return expiresAt; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
    public LocalDateTime getUpdatedAt()      { return updatedAt; }
}
