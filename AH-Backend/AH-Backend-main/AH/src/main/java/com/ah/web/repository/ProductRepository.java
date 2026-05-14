package com.ah.web.repository;

import com.ah.web.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    Page<Product> findByCategorySlug(String slug, Pageable pageable);
    
    @Query("""
SELECT p FROM Product p
WHERE LOWER(CAST(p.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
   OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
""")
    Page<Product> searchByNameOrDescription(@Param("search") String search, Pageable pageable);
    
    List<Product> findByOnSaleTrue();
    
    @Query("""
SELECT p FROM Product p
WHERE p.category.id = :categoryId
AND (
 LOWER(CAST(p.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
 OR LOWER(CAST(p.description AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
)
""")

    Page<Product> searchByCategoryAndName(@Param("categoryId") Long categoryId, 
                                          @Param("search") String search, 
                                          Pageable pageable);

    boolean existsByImageUrl(String imageUrl);
    
    // New Arrivals: Latest products
    List<Product> findTop8ByOrderByCreatedAtDesc();
    
    // Best Sellers: Random for now (using native query for Postgres)
    @Query(value = "SELECT * FROM products ORDER BY RANDOM() LIMIT 8", nativeQuery = true)
    List<Product> findRandomBestSellers();

    @EntityGraph(attributePaths = {"category"})
    @Query("""
SELECT p FROM Product p WHERE
(:categoryId IS NULL OR p.category.id = :categoryId) AND
(:search IS NULL OR
 LOWER(CAST(p.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
 LOWER(CAST(p.sku AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
) AND
(:stockStatus IS NULL OR
 (:stockStatus = 'IN_STOCK' AND p.stock > 10) OR
 (:stockStatus = 'LOW_STOCK' AND p.stock > 0 AND p.stock <= 10) OR
 (:stockStatus = 'OUT_OF_STOCK' AND p.stock = 0)
)
""")
    Page<Product> findWithFilters(@Param("categoryId") Long categoryId,
                                  @Param("search") String search,
                                  @Param("stockStatus") String stockStatus,
                                  Pageable pageable);

    @Query(
    value = """
        SELECT p.*
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE
            (:categoryId IS NULL OR p.category_id = :categoryId)
            AND (:search IS NULL OR CAST(p.name AS TEXT) ILIKE CONCAT('%', CAST(:search AS TEXT), '%'))
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:minRating IS NULL OR p.rating >= :minRating)
            AND (:inStockOnly = false OR p.stock > 0)
            AND (:onSaleOnly = false OR p.on_sale = true)
        ORDER BY p.created_at DESC
        """,
    countQuery = """
        SELECT COUNT(*)
        FROM products p
        WHERE
            (:categoryId IS NULL OR p.category_id = :categoryId)
            AND (:search IS NULL OR CAST(p.name AS TEXT) ILIKE CONCAT('%', CAST(:search AS TEXT), '%'))
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:minRating IS NULL OR p.rating >= :minRating)
            AND (:inStockOnly = false OR p.stock > 0)
            AND (:onSaleOnly = false OR p.on_sale = true)
        """,
    nativeQuery = true
)
Page<Product> findWithAdvancedFilters(
        @Param("categoryId") Long categoryId,
        @Param("search") String search,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") Double minRating,
        @Param("inStockOnly") Boolean inStockOnly,
        @Param("onSaleOnly") Boolean onSaleOnly,
        Pageable pageable
);


    long countByStockLessThanEqual(int stock);
    long countByStock(int stock);

    List<Product> findTop5ByStockLessThanEqualOrderByStockAsc(int stock);

    // Atomic stock decrement — returns 1 on success, 0 if stock insufficient
    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :qty WHERE p.id = :id AND p.stock >= :qty")
    int decrementStock(@Param("id") Long id, @Param("qty") int qty);
}
