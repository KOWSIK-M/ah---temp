package com.ah.web.dto.response;

import com.ah.web.entity.OrderItem;

import java.math.BigDecimal;

public class OrderItemResponse {
    
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal subtotal;

    public OrderItemResponse() {}

    public OrderItemResponse(Long id, Long productId, String productName, String productImageUrl,
                             Integer quantity, BigDecimal priceAtPurchase, BigDecimal subtotal) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
        this.subtotal = subtotal;
    }

    // Getters
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public String getProductImageUrl() { return productImageUrl; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPriceAtPurchase() { return priceAtPurchase; }
    public BigDecimal getSubtotal() { return subtotal; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setProductId(Long productId) { this.productId = productId; }
    public void setProductName(String productName) { this.productName = productName; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setPriceAtPurchase(BigDecimal priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public static OrderItemResponse fromEntity(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        response.setProductName(item.getProductName());
        response.setProductImageUrl(item.getProductImageUrl());
        response.setQuantity(item.getQuantity());
        response.setPriceAtPurchase(item.getPriceAtPurchase());
        
        // Null-safe subtotal calculation
        if (item.getPriceAtPurchase() != null && item.getQuantity() != null) {
            response.setSubtotal(item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())));
        } else {
            response.setSubtotal(BigDecimal.ZERO);
        }
        return response;
    }

    public static OrderItemResponseBuilder builder() { return new OrderItemResponseBuilder(); }

    public static class OrderItemResponseBuilder {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal subtotal;

        public OrderItemResponseBuilder id(Long id) { this.id = id; return this; }
        public OrderItemResponseBuilder productId(Long productId) { this.productId = productId; return this; }
        public OrderItemResponseBuilder productName(String productName) { this.productName = productName; return this; }
        public OrderItemResponseBuilder productImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; return this; }
        public OrderItemResponseBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public OrderItemResponseBuilder priceAtPurchase(BigDecimal priceAtPurchase) { this.priceAtPurchase = priceAtPurchase; return this; }
        public OrderItemResponseBuilder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

        public OrderItemResponse build() {
            return new OrderItemResponse(id, productId, productName, productImageUrl, quantity, priceAtPurchase, subtotal);
        }
    }
}
