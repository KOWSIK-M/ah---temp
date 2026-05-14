package com.ah.web.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class ProductCreateRequest {
    
    @NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    private BigDecimal oldPrice;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private Boolean onSale;
    
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String sku;
    private Double weight;
    private String unit;
    private Boolean featured;
    private String shortDescription;
    private String ingredients;
    private String benefits;
    private String usage;
    private List<String> additionalImages;

    public ProductCreateRequest() {}

    // Getters
    public String getName() { return name; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getOldPrice() { return oldPrice; }
    public String getImageUrl() { return imageUrl; }
    public Double getRating() { return rating; }
    public Integer getReviewCount() { return reviewCount; }
    public Boolean getOnSale() { return onSale; }
    public Integer getStock() { return stock; }
    public Long getCategoryId() { return categoryId; }
    public String getSku() { return sku; }
    public Double getWeight() { return weight; }
    public String getUnit() { return unit; }
    public Boolean getFeatured() { return featured; }
    public String getShortDescription() { return shortDescription; }
    public String getIngredients() { return ingredients; }
    public String getBenefits() { return benefits; }
    public String getUsage() { return usage; }
    public List<String> getAdditionalImages() { return additionalImages; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setRating(Double rating) { this.rating = rating; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public void setOnSale(Boolean onSale) { this.onSale = onSale; }
    public void setStock(Integer stock) { this.stock = stock; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public void setSku(String sku) { this.sku = sku; }
    public void setWeight(Double weight) { this.weight = weight; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public void setUsage(String usage) { this.usage = usage; }
    public void setAdditionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; }
}
