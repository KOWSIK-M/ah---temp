package com.ah.web.dto.response;

import com.ah.web.entity.Category;

public class CategoryResponse {
    
    private Long id;
    private String name;
    private String slug;
    private String imageUrl;
    private String description;
    private Integer displayOrder;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String slug, String imageUrl, String description, Integer displayOrder) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.imageUrl = imageUrl;
        this.description = description;
        this.displayOrder = displayOrder;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public Integer getDisplayOrder() { return displayOrder; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSlug(String slug) { this.slug = slug; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setDescription(String description) { this.description = description; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public static CategoryResponse fromEntity(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setImageUrl(category.getImageUrl());
        response.setDescription(category.getDescription());
        response.setDisplayOrder(category.getDisplayOrder());
        return response;
    }

    public static CategoryResponseBuilder builder() { return new CategoryResponseBuilder(); }

    public static class CategoryResponseBuilder {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
        private String description;
        private Integer displayOrder;

        public CategoryResponseBuilder id(Long id) { this.id = id; return this; }
        public CategoryResponseBuilder name(String name) { this.name = name; return this; }
        public CategoryResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public CategoryResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public CategoryResponseBuilder description(String description) { this.description = description; return this; }
        public CategoryResponseBuilder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }

        public CategoryResponse build() {
            return new CategoryResponse(id, name, slug, imageUrl, description, displayOrder);
        }
    }
}
