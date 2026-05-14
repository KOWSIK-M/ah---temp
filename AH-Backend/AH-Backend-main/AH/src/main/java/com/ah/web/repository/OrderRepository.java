package com.ah.web.repository;

import com.ah.web.entity.Order;
import com.ah.web.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findTop5ByOrderByCreatedAtDesc();
    
    List<Order> findByStatus(OrderStatus status);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
    
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.user LEFT JOIN FETCH o.shippingAddress WHERE o.id = :id AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("id") Long id, @Param("userId") Long userId);
    

    
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "shippingAddress", "items"})
    @Query("""
    SELECT o FROM Order o
    WHERE (:status IS NULL OR o.status = :status)
    AND (
        :search IS NULL OR
        CAST(o.id AS text) LIKE CONCAT('%', CAST(:search AS text), '%') OR
        LOWER(o.user.email) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR
        LOWER(o.user.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) OR
        LOWER(o.user.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
    )
    AND o.createdAt >= COALESCE(:startDate, o.createdAt)
    AND o.createdAt <= COALESCE(:endDate, o.createdAt)
    """)
    Page<Order> findWithFilters(
            @Param("status") OrderStatus status,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    java.math.BigDecimal sumTotalRevenue();

    long countByStatus(OrderStatus status);
    
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o")
    long countTotalCustomers();
}
