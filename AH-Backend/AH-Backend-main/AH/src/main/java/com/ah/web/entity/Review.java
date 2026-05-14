package com.ah.web.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", indexes = {
    @Index(name = "idx_review_product_id", columnList = "product_id"),
    @Index(name = "idx_review_user_id",    columnList = "user_id"),
    @Index(name = "idx_review_created_at", columnList = "created_at")
}, uniqueConstraints = {
    // One review per user per product
    @UniqueConstraint(name = "uk_review_product_user", columnNames = {"product_id", "user_id"})
})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Min(1) @Max(5)
    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    /** True when the reviewer has at least one non-cancelled order containing this product. */
    @Column(name = "verified_purchase")
    private Boolean verifiedPurchase = false;

    @Column(name = "helpful_count")
    private Integer helpfulCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Review() {}

    // Getters
    public Long getId()                    { return id; }
    public Product getProduct()            { return product; }
    public User getUser()                  { return user; }
    public Integer getRating()             { return rating; }
    public String getTitle()               { return title; }
    public String getBody()                { return body; }
    public Boolean getVerifiedPurchase()   { return verifiedPurchase; }
    public Integer getHelpfulCount()       { return helpfulCount; }
    public LocalDateTime getCreatedAt()    { return createdAt; }
    public LocalDateTime getUpdatedAt()    { return updatedAt; }

    // Setters
    public void setId(Long id)                           { this.id = id; }
    public void setProduct(Product product)              { this.product = product; }
    public void setUser(User user)                       { this.user = user; }
    public void setRating(Integer rating)                { this.rating = rating; }
    public void setTitle(String title)                   { this.title = title; }
    public void setBody(String body)                     { this.body = body; }
    public void setVerifiedPurchase(Boolean v)           { this.verifiedPurchase = v; }
    public void setHelpfulCount(Integer helpfulCount)    { this.helpfulCount = helpfulCount; }
    public void setCreatedAt(LocalDateTime createdAt)    { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt)    { this.updatedAt = updatedAt; }
}
