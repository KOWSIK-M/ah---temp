package com.ah.web.service;

import com.ah.web.dto.request.ApplyCouponRequest;
import com.ah.web.dto.request.CouponRequest;
import com.ah.web.dto.response.CouponResponse;
import com.ah.web.dto.response.CouponValidationResponse;
import com.ah.web.entity.Coupon;
import com.ah.web.entity.Coupon.DiscountType;
import com.ah.web.exception.BadRequestException;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.repository.CouponRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // ──────────────────────────────────────────────
    //  Public: Validate a coupon (no side-effects)
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public CouponValidationResponse validate(ApplyCouponRequest request) {
        return doValidate(request.getCode(), request.getOrderAmount());
    }

    /**
     * Internal: validate and return the coupon + discount amount together.
     * Used by OrderService so it doesn't need a second DB lookup.
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validateForOrder(String code, BigDecimal orderAmount) {
        if (code == null || code.isBlank()) return null;
        return doValidate(code.trim(), orderAmount);
    }

    /**
     * Called inside an order transaction — increments usedCount.
     * Returns the actual discount amount applied.
     */
    @Transactional
    public BigDecimal applyToOrder(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Coupon '" + code + "' is no longer valid"));

        BigDecimal discount = calculateDiscount(coupon, orderAmount);

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        // Auto-deactivate when max uses reached
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            coupon.setActive(false);
        }
        couponRepository.save(coupon);

        return discount;
    }

    // ──────────────────────────────────────────────
    //  Admin CRUD
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CouponResponse> getAll(Pageable pageable) {
        return couponRepository.findAll(pageable).map(CouponResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CouponResponse getById(Long id) {
        return CouponResponse.fromEntity(findOrThrow(id));
    }

    @Transactional
    public CouponResponse create(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Coupon code '" + request.getCode() + "' already exists");
        }
        Coupon coupon = mapRequestToEntity(new Coupon(), request);
        return CouponResponse.fromEntity(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = findOrThrow(id);
        // Allow renaming as long as new code doesn't clash with another coupon
        if (!coupon.getCode().equalsIgnoreCase(request.getCode())
                && couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Coupon code '" + request.getCode() + "' already exists");
        }
        mapRequestToEntity(coupon, request);
        return CouponResponse.fromEntity(couponRepository.save(coupon));
    }

    @Transactional
    public void delete(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon", "id", id);
        }
        couponRepository.deleteById(id);
    }

    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    private CouponValidationResponse doValidate(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code).orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.failure("Invalid coupon code");
        }
        if (!Boolean.TRUE.equals(coupon.getActive())) {
            return CouponValidationResponse.failure("This coupon is no longer active");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return CouponValidationResponse.failure("This coupon has expired");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return CouponValidationResponse.failure("This coupon has reached its usage limit");
        }
        if (coupon.getMinOrderAmount() != null
                && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidationResponse.failure(
                "Minimum order amount of ₹" + coupon.getMinOrderAmount().setScale(0, RoundingMode.HALF_UP)
                + " required for this coupon"
            );
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);
        return CouponValidationResponse.success(coupon, orderAmount, discount);
    }

    BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Apply cap if set
            if (coupon.getMaxDiscountAmount() != null
                    && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            // FIXED — can't discount more than the order amount
            discount = coupon.getDiscountValue().min(orderAmount);
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private Coupon mapRequestToEntity(Coupon coupon, CouponRequest req) {
        coupon.setCode(req.getCode().toUpperCase());
        coupon.setDescription(req.getDescription());
        coupon.setDiscountType(req.getDiscountType());
        coupon.setDiscountValue(req.getDiscountValue());
        coupon.setMinOrderAmount(req.getMinOrderAmount() != null ? req.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(req.getMaxDiscountAmount());
        coupon.setMaxUses(req.getMaxUses());
        coupon.setActive(req.getActive() != null ? req.getActive() : true);
        coupon.setExpiresAt(req.getExpiresAt());
        return coupon;
    }

    private Coupon findOrThrow(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
    }
}
