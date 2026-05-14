package com.ah.web.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String slug;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer displayOrder = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Product> products = new ArrayList<>();

    // Default constructor
    public Category() {}

    // All-args constructor
    public Category(Long id, String name, String slug, String imageUrl, String description, Integer displayOrder, List<Product> products) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.description = description;
        this.displayOrder = displayOrder;
        this.products = products;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public Integer getDisplayOrder() { return displayOrder; }
    public List<Product> getProducts() { return products; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setDescription(String description) { this.description = description; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public void setProducts(List<Product> products) { this.products = products; }

    // Builder
    public static CategoryBuilder builder() { return new CategoryBuilder(); }

    public static class CategoryBuilder {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
        private String description;
        private Integer displayOrder = 0;
        private List<Product> products = new ArrayList<>();

        public CategoryBuilder id(Long id) { this.id = id; return this; }
        public CategoryBuilder name(String name) { this.name = name; return this; }
        public CategoryBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CategoryBuilder description(String description) { this.description = description; return this; }
        public CategoryBuilder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }
        public CategoryBuilder products(List<Product> products) { this.products = products; return this; }

        public Category build() {
            return new Category(id, name, slug, imageUrl, description, displayOrder, products);
        }
    }
}
