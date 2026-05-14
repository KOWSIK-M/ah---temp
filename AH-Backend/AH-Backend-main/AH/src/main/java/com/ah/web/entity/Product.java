package com.ah.web.entity;

import jakarta.persistence.*;
import jakarta.persistence.Index;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category_id", columnList = "category_id"),
    @Index(name = "idx_product_price", columnList = "price"),
    @Index(name = "idx_product_created_at", columnList = "created_at"),
    @Index(name = "idx_product_rating", columnList = "rating"),
    @Index(name = "idx_product_on_sale", columnList = "on_sale"),
    @Index(name = "idx_product_stock", columnList = "stock")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(precision = 10, scale = 2)
    private BigDecimal oldPrice;

    private String imageUrl;

    @DecimalMin("0.0")
    @DecimalMax("5.0")
    private Double rating = 0.0;

    @Min(0)
    private Integer reviewCount = 0;

    private Boolean onSale = false;

    @Min(0)
    private Integer stock = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(unique = true, columnDefinition = "TEXT")
    private String sku;

    private Double weight;

    private String unit;

    private Boolean featured = false;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String usage;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> additionalImages = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Default constructor
    public Product() {}

    // All-args constructor
    public Product(Long id, String name, String description, BigDecimal price, BigDecimal oldPrice,
                   String imageUrl, Double rating, Integer reviewCount, Boolean onSale, Integer stock,
                   Category category, String sku, Double weight, String unit, Boolean featured,
                   String shortDescription, String ingredients, String benefits, String usage,
                   List<String> additionalImages, LocalDateTime createdAt, LocalDateTime updatedAt) {
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
        this.category = category;
        this.sku = sku;
        this.weight = weight;
        this.unit = unit;
        this.featured = featured;
        this.shortDescription = shortDescription;
        this.ingredients = ingredients;
        this.benefits = benefits;
        this.usage = usage;
        this.additionalImages = additionalImages;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    public Category getCategory() { return category; }
    public String getSku() { return sku; }
    public Double getWeight() { return weight; }
    public String getUnit() { return unit; }
    public Boolean getFeatured() { return featured; }
    public String getShortDescription() { return shortDescription; }
    public String getIngredients() { return ingredients; }
    public String getBenefits() { return benefits; }
    public String getUsage() { return usage; }
    public List<String> getAdditionalImages() { return additionalImages; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

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
    public void setCategory(Category category) { this.category = category; }
    public void setSku(String sku) { this.sku = sku; }
    public void setWeight(Double weight) { this.weight = weight; }
    public void setUnit(String unit) { this.unit = unit; }
    public void setFeatured(Boolean featured) { this.featured = featured; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public void setUsage(String usage) { this.usage = usage; }
    public void setAdditionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern
    public static ProductBuilder builder() { return new ProductBuilder(); }

    public static class ProductBuilder {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal oldPrice;
        private String imageUrl;
        private Double rating = 0.0;
        private Integer reviewCount = 0;
        private Boolean onSale = false;
        private Integer stock = 0;
        private Category category;
        private String sku;
        private Double weight;
        private String unit;
        private Boolean featured = false;
        private String shortDescription;
        private String ingredients;
        private String benefits;
        private String usage;
        private List<String> additionalImages = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder name(String name) { this.name = name; return this; }
        public ProductBuilder description(String description) { this.description = description; return this; }
        public ProductBuilder price(BigDecimal price) { this.price = price; return this; }
        public ProductBuilder oldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; return this; }
        public ProductBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductBuilder rating(Double rating) { this.rating = rating; return this; }
        public ProductBuilder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public ProductBuilder onSale(Boolean onSale) { this.onSale = onSale; return this; }
        public ProductBuilder stock(Integer stock) { this.stock = stock; return this; }
        public ProductBuilder category(Category category) { this.category = category; return this; }
        public ProductBuilder sku(String sku) { this.sku = sku; return this; }
        public ProductBuilder weight(Double weight) { this.weight = weight; return this; }
        public ProductBuilder unit(String unit) { this.unit = unit; return this; }
        public ProductBuilder featured(Boolean featured) { this.featured = featured; return this; }
        public ProductBuilder shortDescription(String shortDescription) { this.shortDescription = shortDescription; return this; }
        public ProductBuilder ingredients(String ingredients) { this.ingredients = ingredients; return this; }
        public ProductBuilder benefits(String benefits) { this.benefits = benefits; return this; }
        public ProductBuilder usage(String usage) { this.usage = usage; return this; }
        public ProductBuilder additionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; return this; }
        public ProductBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProductBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Product build() {
            return new Product(id, name, description, price, oldPrice, imageUrl, rating, reviewCount,
                    onSale, stock, category, sku, weight, unit, featured, shortDescription,
                    ingredients, benefits, usage, additionalImages, createdAt, updatedAt);
        }
    }
}
