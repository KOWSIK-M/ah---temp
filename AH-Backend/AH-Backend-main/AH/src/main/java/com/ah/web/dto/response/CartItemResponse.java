package com.ah.web.dto.response;

import com.ah.web.entity.CartItem;

import java.math.BigDecimal;

public class CartItemResponse {
    
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice;
    private Integer quantity;
    private BigDecimal subtotal;

    public CartItemResponse() {}

    public CartItemResponse(Long id, Long productId, String productName, String productImageUrl,
                            BigDecimal productPrice, Integer quantity, BigDecimal subtotal) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.productPrice = productPrice;
        this.quantity = quantity;
        this.subtotal = subtotal;
    }

    // Getters
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public BigDecimal getProductPrice() { return productPrice; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getSubtotal() { return subtotal; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setProductName(String productName) { this.productName = productName; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    public void setProductPrice(BigDecimal productPrice) { this.productPrice = productPrice; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public static CartItemResponse fromEntity(CartItem item) {
        BigDecimal price = item.getProduct().getPrice();
        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setProductImageUrl(item.getProduct().getImageUrl());
        response.setProductPrice(price);
        response.setQuantity(item.getQuantity());
        response.setSubtotal(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        return response;
    }

    public static CartItemResponseBuilder builder() { return new CartItemResponseBuilder(); }

    public static class CartItemResponseBuilder {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal productPrice;
        private Integer quantity;
        private BigDecimal subtotal;

        public CartItemResponseBuilder id(Long id) { this.id = id; return this; }
        public CartItemResponseBuilder productId(Long productId) { this.productId = productId; return this; }
        public CartItemResponseBuilder productName(String productName) { this.productName = productName; return this; }
        public CartItemResponseBuilder productImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; return this; }
        public CartItemResponseBuilder productPrice(BigDecimal productPrice) { this.productPrice = productPrice; return this; }
        public CartItemResponseBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public CartItemResponseBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

        public CartItemResponse build() {
            return new CartItemResponse(id, productId, productName, productImageUrl, productPrice, quantity, subtotal);
        }
    }
}
