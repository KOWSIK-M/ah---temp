package com.ah.web.dto.response;

import java.util.Map;

/**
 * Aggregated review statistics returned alongside the paginated review list.
 */
public class ReviewSummaryResponse {

    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution;  // { 5: 120, 4: 30, 3: 10, 2: 5, 1: 2 }
    private boolean currentUserReviewed;             // has the calling user already left a review?

    public ReviewSummaryResponse() {}

    public ReviewSummaryResponse(Double averageRating, Long totalReviews,
                                  Map<Integer, Long> ratingDistribution,
                                  boolean currentUserReviewed) {
        this.averageRating        = averageRating;
        this.totalReviews         = totalReviews;
        this.ratingDistribution   = ratingDistribution;
        this.currentUserReviewed  = currentUserReviewed;
    }

    public Double getAverageRating()                       { return averageRating; }
    public Long getTotalReviews()                          { return totalReviews; }
    public Map<Integer, Long> getRatingDistribution()      { return ratingDistribution; }
    public boolean isCurrentUserReviewed()                 { return currentUserReviewed; }
}
