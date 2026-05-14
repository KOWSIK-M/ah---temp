package com.ah.web.repository;

import com.ah.web.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<Review> findByProductIdOrderByHelpfulCountDesc(Long productId, Pageable pageable);

    Page<Review> findByProductIdAndRatingOrderByCreatedAtDesc(Long productId, Integer rating, Pageable pageable);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    /** Returns rows of [rating (Integer), count (Long)] for a product. */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.product.id = :productId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> findRatingDistributionByProductId(@Param("productId") Long productId);

    /**
     * Returns true if the user has at least one non-cancelled order that contains this product.
     * Used to set the "Verified Purchase" badge.
     */
    @Query("""
        SELECT COUNT(oi) > 0
        FROM OrderItem oi
        WHERE oi.order.user.id = :userId
          AND oi.product.id   = :productId
          AND oi.order.status <> com.ah.web.entity.OrderStatus.CANCELLED
        """)
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
