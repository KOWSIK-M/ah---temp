package com.ah.web.dto.response;

import com.ah.web.entity.Cart;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class CartResponse {
    
    private Long id;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal totalAmount;

    public CartResponse() {}

    public CartResponse(Long id, List<CartItemResponse> items, Integer totalItems, BigDecimal totalAmount) {
        this.id = id;
        this.items = items;
        this.totalItems = totalItems;
        this.totalAmount = totalAmount;
    }

    // Getters
    public Long getId() { return id; }
    public List<CartItemResponse> getItems() { return items; }
    public Integer getTotalItems() { return totalItems; }
    public BigDecimal getTotalAmount() { return totalAmount; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public static CartResponse fromEntity(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(CartItemResponse::fromEntity)
                .collect(Collectors.toList());
        
        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalItems = cart.getItems().stream()
                .mapToInt(item -> item.getQuantity())
                .sum();

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setItems(itemResponses);
        response.setTotalItems(totalItems);
        response.setTotalAmount(total);
        return response;
    }

    public static CartResponseBuilder builder() { return new CartResponseBuilder(); }

    public static class CartResponseBuilder {
        private Long id;
        private List<CartItemResponse> items;
        private Integer totalItems;
        private BigDecimal totalAmount;

        public CartResponseBuilder id(Long id) { this.id = id; return this; }
        public CartResponseBuilder items(List<CartItemResponse> items) { this.items = items; return this; }
        public CartResponseBuilder totalItems(Integer totalItems) { this.totalItems = totalItems; return this; }
        public CartResponseBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }

        public CartResponse build() {
            return new CartResponse(id, items, totalItems, totalAmount);
        }
    }
}
