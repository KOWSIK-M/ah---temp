package com.ah.web.dto.response;

import com.ah.web.entity.Review;

import java.time.LocalDateTime;
import java.util.Map;

public class ReviewResponse {

    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String title;
    private String body;
    private Boolean verifiedPurchase;
    private Integer helpfulCount;
    private LocalDateTime createdAt;

    // ── Summary fields (returned alongside the page) ──────────────────────
    // These are null on individual review rows; set by the service for the
    // summary object only.
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution;

    public static ReviewResponse fromEntity(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.id               = r.getId();
        dto.productId        = r.getProduct().getId();
        dto.userId           = r.getUser().getId();
        dto.userName         = r.getUser().getFirstName() + " " + r.getUser().getLastName().charAt(0) + ".";
        dto.rating           = r.getRating();
        dto.title            = r.getTitle();
        dto.body             = r.getBody();
        dto.verifiedPurchase = r.getVerifiedPurchase();
        dto.helpfulCount     = r.getHelpfulCount();
        dto.createdAt        = r.getCreatedAt();
        return dto;
    }

    // Getters
    public Long getId()                            { return id; }
    public Long getProductId()                     { return productId; }
    public Long getUserId()                        { return userId; }
    public String getUserName()                    { return userName; }
    public Integer getRating()                     { return rating; }
    public String getTitle()                       { return title; }
    public String getBody()                        { return body; }
    public Boolean getVerifiedPurchase()           { return verifiedPurchase; }
    public Integer getHelpfulCount()               { return helpfulCount; }
    public LocalDateTime getCreatedAt()            { return createdAt; }
    public Double getAverageRating()               { return averageRating; }
    public Long getTotalReviews()                  { return totalReviews; }
    public Map<Integer, Long> getRatingDistribution() { return ratingDistribution; }

    // Setters
    public void setAverageRating(Double averageRating)                     { this.averageRating = averageRating; }
    public void setTotalReviews(Long totalReviews)                         { this.totalReviews = totalReviews; }
    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) { this.ratingDistribution = ratingDistribution; }
}
