package com.ah.web.dto.response;

import com.ah.web.entity.Product;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductResponse {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private Boolean onSale;
    private Integer stock;
    private Long categoryId;
    private String categoryName;
    private String sku;
    private Double weight;
    private String unit;
    private Boolean featured;
    private String shortDescription;
    private String ingredients;
    private String benefits;
    private String usage;
    private List<String> additionalImages;

    public ProductResponse() {}

    public ProductResponse(Long id, String name, String description, BigDecimal price, BigDecimal oldPrice,
                           String imageUrl, Double rating, Integer reviewCount, Boolean onSale, Integer stock,
                           Long categoryId, String categoryName, String sku, Double weight, String unit,
                           Boolean featured, String shortDescription, String ingredients, String benefits,
                           String usage, List<String> additionalImages) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.oldPrice = oldPrice;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.onSale = onSale;
        this.stock = stock;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.sku = sku;
        this.weight = weight;
        this.unit = unit;
        this.featured = featured;
        this.shortDescription = shortDescription;
        this.ingredients = ingredients;
        this.benefits = benefits;
        this.usage = usage;
        this.additionalImages = additionalImages;
    }

    // Getters
    public Long getId() { return id; }
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
    public String getCategoryName() { return categoryName; }
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
    public void setId(Long id) { this.id = id; }
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
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public void setSku(String sku) { this.sku = sku; }
    public void setWeight(Double weight) { this.weight = weight; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public void setUsage(String usage) { this.usage = usage; }
    public void setAdditionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; }

    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setImageUrl(product.getImageUrl());
        response.setRating(product.getRating());
        response.setReviewCount(product.getReviewCount());
        response.setOnSale(product.getOnSale());
        response.setStock(product.getStock());
        response.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        response.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        response.setSku(product.getSku());
        response.setWeight(product.getWeight());
        response.setUnit(product.getUnit());
        response.setFeatured(product.getFeatured());
        response.setShortDescription(product.getShortDescription());
        response.setIngredients(product.getIngredients());
        response.setBenefits(product.getBenefits());
        response.setUsage(product.getUsage());
        response.setAdditionalImages(product.getAdditionalImages() != null ? new ArrayList<>(product.getAdditionalImages()) : null);
        return response;
    }

    public static ProductResponseBuilder builder() { return new ProductResponseBuilder(); }

    public static class ProductResponseBuilder {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private String imageUrl;
        private Double rating;
        private Integer reviewCount;
        private Boolean onSale;
        private Integer stock;
        private Long categoryId;
        private String categoryName;
        private String sku;
        private Double weight;
        private String unit;
        private Boolean featured;
        private String shortDescription;
        private String ingredients;
        private String benefits;
        private String usage;
        private List<String> additionalImages;

        public ProductResponseBuilder id(Long id) { this.id = id; return this; }
        public ProductResponseBuilder name(String name) { this.name = name; return this; }
        public ProductResponseBuilder description(String description) { this.description = description; return this; }
        public ProductResponseBuilder price(BigDecimal price) { this.price = price; return this; }
        public ProductResponseBuilder oldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; return this; }
        public ProductResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductResponseBuilder rating(Double rating) { this.rating = rating; return this; }
        public ProductResponseBuilder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public ProductResponseBuilder onSale(Boolean onSale) { this.onSale = onSale; return this; }
        public ProductResponseBuilder stock(Integer stock) { this.stock = stock; return this; }
        public ProductResponseBuilder categoryId(Long categoryId) { this.categoryId = categoryId; return this; }
        public ProductResponseBuilder categoryName(String categoryName) { this.categoryName = categoryName; return this; }
        public ProductResponseBuilder sku(String sku) { this.sku = sku; return this; }
        public ProductResponseBuilder weight(Double weight) { this.weight = weight; return this; }
        public ProductResponseBuilder unit(String unit) { this.unit = unit; return this; }
        public ProductResponseBuilder featured(Boolean featured) { this.featured = featured; return this; }
        public ProductResponseBuilder shortDescription(String shortDescription) { this.shortDescription = shortDescription; return this; }
        public ProductResponseBuilder ingredients(String ingredients) { this.ingredients = ingredients; return this; }
        public ProductResponseBuilder benefits(String benefits) { this.benefits = benefits; return this; }
        public ProductResponseBuilder usage(String usage) { this.usage = usage; return this; }
        public ProductResponseBuilder additionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; return this; }

        public ProductResponse build() {
            return new ProductResponse(id, name, description, price, oldPrice, imageUrl, rating, reviewCount,
                    onSale, stock, categoryId, categoryName, sku, weight, unit, featured, shortDescription,
                    ingredients, benefits, usage, additionalImages);
        }
    }
}
