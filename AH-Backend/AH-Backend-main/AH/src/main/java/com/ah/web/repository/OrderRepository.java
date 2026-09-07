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

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID' AND o.status <> com.ah.web.entity.OrderStatus.CANCELLED")
    java.math.BigDecimal sumTotalRevenue();

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> lockById(@Param("id") Long id);
    Optional<Order> findByGatewayOrderId(String gatewayOrderId);
    Optional<Order> findByPaymentId(String paymentId);
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.paymentMethod = :method AND o.paymentStatus = :paymentStatus AND o.createdAt < :before")
    List<Order> findExpiredPendingPayments(@Param("status") OrderStatus status,
                                           @Param("method") String method,
                                           @Param("paymentStatus") String paymentStatus,
                                           @Param("before") LocalDateTime before);
    boolean existsByShippingAddressId(Long addressId);
    long countByUserId(Long userId);
    long countByPaymentStatus(String paymentStatus);
    long countByStatus(OrderStatus status);
    
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o")
    long countTotalCustomers();
}
