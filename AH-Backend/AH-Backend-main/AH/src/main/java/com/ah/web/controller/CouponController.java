package com.ah.web.controller;

import com.ah.web.dto.request.ApplyCouponRequest;
import com.ah.web.dto.response.CouponValidationResponse;
import com.ah.web.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public coupon endpoints (no admin CRUD here — those live in AdminController).
 */
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /**
     * POST /api/coupons/validate
     * Authenticated users — validate a coupon against a cart total.
     * No side-effects (does NOT increment usedCount).
     */
    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validate(
            @Valid @RequestBody ApplyCouponRequest request) {
        return ResponseEntity.ok(couponService.validate(request));
    }
}
