package com.ah.web.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReviewRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String title;

    @NotBlank(message = "Review body is required")
    private String body;

    public Integer getRating() { return rating; }
    public String getTitle()   { return title; }
    public String getBody()    { return body; }

    public void setRating(Integer rating) { this.rating = rating; }
    public void setTitle(String title)    { this.title = title; }
    public void setBody(String body)      { this.body = body; }
}
