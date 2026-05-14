package com.ah.web.controller;

import com.ah.web.dto.request.ReviewRequest;
import com.ah.web.dto.response.ReviewResponse;
import com.ah.web.dto.response.ReviewSummaryResponse;
import com.ah.web.entity.User;
import com.ah.web.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /** GET /api/products/{id}/reviews — public, paginated */
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(required = false) Integer ratingFilter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(reviewService.getReviews(productId, sort, ratingFilter, pageable));
    }

    /** GET /api/products/{id}/reviews/summary — public, aggregate stats */
    @GetMapping("/products/{productId}/reviews/summary")
    public ResponseEntity<ReviewSummaryResponse> getSummary(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user) {  // null for anonymous callers
        return ResponseEntity.ok(reviewService.getSummary(productId, user));
    }

    /** POST /api/products/{id}/reviews — authenticated */
    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal User user) {

        ReviewResponse created = reviewService.createReview(productId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** PUT /api/reviews/{id}/helpful — authenticated */
    @PutMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<ReviewResponse> markHelpful(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.markHelpful(reviewId, user));
    }

    /** DELETE /api/reviews/{id} — owner or ADMIN */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user) {
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.noContent().build();
    }
}
