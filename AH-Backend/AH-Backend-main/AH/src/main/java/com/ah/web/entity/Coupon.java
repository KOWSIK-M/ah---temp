package com.ah.web.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    public enum DiscountType { PERCENTAGE, FIXED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    /** Order must be at least this amount to use the coupon. */
    @Column(name = "min_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** For PERCENTAGE coupons: maximum rupee discount allowed. Null = no cap. */
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    /** Total allowed redemptions. Null = unlimited. */
    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Coupon() {}

    // Getters
    public Long getId()                       { return id; }
    public String getCode()                   { return code; }
    public String getDescription()            { return description; }
    public DiscountType getDiscountType()     { return discountType; }
    public BigDecimal getDiscountValue()      { return discountValue; }
    public BigDecimal getMinOrderAmount()     { return minOrderAmount; }
    public BigDecimal getMaxDiscountAmount()  { return maxDiscountAmount; }
    public Integer getMaxUses()               { return maxUses; }
    public Integer getUsedCount()             { return usedCount; }
    public Boolean getActive()                { return active; }
    public LocalDateTime getExpiresAt()       { return expiresAt; }
    public LocalDateTime getCreatedAt()       { return createdAt; }
    public LocalDateTime getUpdatedAt()       { return updatedAt; }

    // Setters
    public void setCode(String code)                              { this.code = code; }
    public void setDescription(String description)                { this.description = description; }
    public void setDiscountType(DiscountType discountType)        { this.discountType = discountType; }
    public void setDiscountValue(BigDecimal discountValue)        { this.discountValue = discountValue; }
    public void setMinOrderAmount(BigDecimal minOrderAmount)      { this.minOrderAmount = minOrderAmount; }
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount){ this.maxDiscountAmount = maxDiscountAmount; }
    public void setMaxUses(Integer maxUses)                       { this.maxUses = maxUses; }
    public void setUsedCount(Integer usedCount)                   { this.usedCount = usedCount; }
    public void setActive(Boolean active)                         { this.active = active; }
    public void setExpiresAt(LocalDateTime expiresAt)             { this.expiresAt = expiresAt; }
}
