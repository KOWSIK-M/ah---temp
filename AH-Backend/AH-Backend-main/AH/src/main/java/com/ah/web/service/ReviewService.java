package com.ah.web.service;

import com.ah.web.dto.request.ReviewRequest;
import com.ah.web.dto.response.ReviewResponse;
import com.ah.web.dto.response.ReviewSummaryResponse;
import com.ah.web.entity.Product;
import com.ah.web.entity.Review;
import com.ah.web.entity.User;
import com.ah.web.exception.BadRequestException;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.exception.UnauthorizedException;
import com.ah.web.repository.ProductRepository;
import com.ah.web.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    // ── Public read ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviews(Long productId, String sort,
                                            Integer ratingFilter, Pageable pageable) {
        ensureProductExists(productId);

        Page<Review> page;
        if (ratingFilter != null) {
            page = reviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(
                    productId, ratingFilter, pageable);
        } else if ("helpful".equals(sort)) {
            page = reviewRepository.findByProductIdOrderByHelpfulCountDesc(productId, pageable);
        } else {
            page = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        }
        return page.map(ReviewResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummary(Long productId, User currentUser) {
        ensureProductExists(productId);

        Double avg   = reviewRepository.findAverageRatingByProductId(productId);
        long   total = reviewRepository.countByProductId(productId);

        // Build distribution map {5: n, 4: n, 3: n, 2: n, 1: n}
        Map<Integer, Long> dist = new HashMap<>();
        for (int i = 1; i <= 5; i++) dist.put(i, 0L);
        List<Object[]> rows = reviewRepository.findRatingDistributionByProductId(productId);
        for (Object[] row : rows) {
            dist.put((Integer) row[0], (Long) row[1]);
        }

        boolean alreadyReviewed = currentUser != null &&
                reviewRepository.existsByProductIdAndUserId(productId, currentUser.getId());

        return new ReviewSummaryResponse(
                avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0,
                total,
                dist,
                alreadyReviewed
        );
    }

    // ── Write ────────────────────────────────────────────────────────────────

    @Transactional
    public ReviewResponse createReview(Long productId, ReviewRequest request, User user) {
        if (user == null) throw new UnauthorizedException("Authentication required");

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setBody(request.getBody());
        review.setVerifiedPurchase(
                reviewRepository.hasUserPurchasedProduct(user.getId(), productId));

        Review saved = reviewRepository.save(review);
        recalculateProductRating(product);
        return ReviewResponse.fromEntity(saved);
    }

    @Transactional
    public ReviewResponse markHelpful(Long reviewId, User user) {
        if (user == null) throw new UnauthorizedException("Authentication required");
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return ReviewResponse.fromEntity(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId, User user) {
        if (user == null) throw new UnauthorizedException("Authentication required");

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        boolean isOwner = review.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to delete this review");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRating(product);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product", "id", productId);
        }
    }

    /**
     * Recalculates Product.rating and Product.reviewCount from live review data
     * so every product listing/detail response stays in sync.
     */
    private void recalculateProductRating(Product product) {
        Double avg   = reviewRepository.findAverageRatingByProductId(product.getId());
        long   count = reviewRepository.countByProductId(product.getId());
        product.setRating(avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0);
        product.setReviewCount((int) count);
        productRepository.save(product);
    }
}
