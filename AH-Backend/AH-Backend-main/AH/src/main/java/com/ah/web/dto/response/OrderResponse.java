package com.ah.web.dto.response;

import com.ah.web.entity.Order;
import com.ah.web.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {
    
    private Long id;
    private List<OrderItemResponse> items;
    private String shippingAddressSnapshot;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private BigDecimal shippingCharges;
    private BigDecimal taxAmount;
    private String paymentId;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String userEmail;
    private String userName;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private AddressResponse shippingAddress;
    private PaymentDetails payment;
    private LocalDateTime estimatedDelivery;

    public static class PaymentDetails {
        private String method;
        private BigDecimal amount;
        private String status;

        public PaymentDetails() {}
        public PaymentDetails(String method, BigDecimal amount, String status) {
            this.method = method;
            this.amount = amount;
            this.status = status;
        }

        public String getMethod() { return method; }
        public BigDecimal getAmount() { return amount; }
        public String getStatus() { return status; }

        public void setMethod(String method) { this.method = method; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public void setStatus(String status) { this.status = status; }
    }

    public OrderResponse() {}

    public OrderResponse(Long id, List<OrderItemResponse> items, String shippingAddressSnapshot, OrderStatus status,
                         BigDecimal totalAmount, BigDecimal shippingCharges, BigDecimal taxAmount, String paymentId,
                         String paymentStatus, LocalDateTime createdAt, LocalDateTime updatedAt, Long userId,
                         String userEmail, String userName, String customerName, String customerEmail,
                         String customerPhone, AddressResponse shippingAddress, PaymentDetails payment, LocalDateTime estimatedDelivery) {
        this.id = id;
        this.items = items;
        this.shippingAddressSnapshot = shippingAddressSnapshot;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingCharges = shippingCharges;
        this.taxAmount = taxAmount;
        this.paymentId = paymentId;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.shippingAddress = shippingAddress;
        this.payment = payment;
        this.estimatedDelivery = estimatedDelivery;
    }

    // Getters
    public Long getId() { return id; }
    public List<OrderItemResponse> getItems() { return items; }
    public String getShippingAddressSnapshot() { return shippingAddressSnapshot; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public String getCouponCode() { return couponCode; }
    public BigDecimal getShippingCharges() { return shippingCharges; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public String getPaymentId() { return paymentId; }
    public String getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Long getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getUserName() { return userName; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public AddressResponse getShippingAddress() { return shippingAddress; }
    public PaymentDetails getPayment() { return payment; }
    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
    public void setShippingAddressSnapshot(String shippingAddressSnapshot) { this.shippingAddressSnapshot = shippingAddressSnapshot; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
    public void setShippingCharges(BigDecimal shippingCharges) { this.shippingCharges = shippingCharges; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setUserName(String userName) { this.userName = userName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public void setShippingAddress(AddressResponse shippingAddress) { this.shippingAddress = shippingAddress; }
    public void setPayment(PaymentDetails payment) { this.payment = payment; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public static OrderResponse fromEntity(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null 
                ? order.getItems().stream()
                    .map(OrderItemResponse::fromEntity)
                    .collect(Collectors.toList())
                : List.of();
        
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setItems(itemResponses);
        response.setShippingAddressSnapshot(order.getShippingAddressSnapshot());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setCouponCode(order.getCouponCode());
        response.setShippingCharges(order.getShippingCharges());
        response.setTaxAmount(order.getTaxAmount());
        response.setPaymentId(order.getPaymentId());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Null-safe user handling
        if (order.getUser() != null) {
            response.setUserId(order.getUser().getId());
            response.setUserEmail(order.getUser().getEmail());
            response.setUserName(order.getUser().getFullName());
            response.setCustomerName(order.getUser().getFullName());
            response.setCustomerEmail(order.getUser().getEmail());
            response.setCustomerPhone(order.getUser().getPhone());
        }
        
        // Null-safe shipping address handling
        response.setShippingAddress(order.getShippingAddress() != null 
                ? AddressResponse.fromEntity(order.getShippingAddress()) 
                : null);
        
        response.setPayment(new PaymentDetails(order.getPaymentMethod(), order.getTotalAmount(), order.getPaymentStatus()));
        response.setEstimatedDelivery(order.getCreatedAt() != null ? order.getCreatedAt().plusDays(5) : LocalDateTime.now().plusDays(5));
        return response;
    }

    public static OrderResponseBuilder builder() { return new OrderResponseBuilder(); }

    public static class OrderResponseBuilder {
        private Long id;
        private List<OrderItemResponse> items;
        private String shippingAddressSnapshot;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private BigDecimal shippingCharges;
        private BigDecimal taxAmount;
        private String paymentId;
        private String paymentStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long userId;
        private String userEmail;
        private String userName;
        private String customerName;
        private String customerEmail;
        private String customerPhone;
        private AddressResponse shippingAddress;
        private PaymentDetails payment;
        private LocalDateTime estimatedDelivery;

        public OrderResponseBuilder id(Long id) { this.id = id; return this; }
        public OrderResponseBuilder items(List<OrderItemResponse> items) { this.items = items; return this; }
        public OrderResponseBuilder shippingAddressSnapshot(String shippingAddressSnapshot) { this.shippingAddressSnapshot = shippingAddressSnapshot; return this; }
        public OrderResponseBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderResponseBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderResponseBuilder shippingCharges(BigDecimal shippingCharges) { this.shippingCharges = shippingCharges; return this; }
        public OrderResponseBuilder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
        public OrderResponseBuilder paymentId(String paymentId) { this.paymentId = paymentId; return this; }
        public OrderResponseBuilder paymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public OrderResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OrderResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public OrderResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public OrderResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public OrderResponseBuilder userName(String userName) { this.userName = userName; return this; }
        public OrderResponseBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public OrderResponseBuilder customerEmail(String customerEmail) { this.customerEmail = customerEmail; return this; }
        public OrderResponseBuilder customerPhone(String customerPhone) { this.customerPhone = customerPhone; return this; }
        public OrderResponseBuilder shippingAddress(AddressResponse shippingAddress) { this.shippingAddress = shippingAddress; return this; }
        public OrderResponseBuilder payment(PaymentDetails payment) { this.payment = payment; return this; }
        public OrderResponseBuilder estimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; return this; }

        public OrderResponse build() {
            return new OrderResponse(id, items, shippingAddressSnapshot, status, totalAmount, shippingCharges,
                    taxAmount, paymentId, paymentStatus, createdAt, updatedAt, userId, userEmail, userName,
                    customerName, customerEmail, customerPhone, shippingAddress, payment, estimatedDelivery);
        }
    }
}
