package com.ah.web.dto.response;

public class UserResponse {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private java.time.LocalDateTime createdAt;
    private Long totalOrders;
    private Double totalSpent;
    private Double avgOrderValue;
    private java.time.LocalDateTime lastOrderDate;
    private String status;

    public UserResponse() {}

    public UserResponse(Long id, String email, String firstName, String lastName, String phone, String role, 
                        java.time.LocalDateTime createdAt, Long totalOrders, Double totalSpent, 
                        Double avgOrderValue, java.time.LocalDateTime lastOrderDate, String status) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
        this.avgOrderValue = avgOrderValue;
        this.lastOrderDate = lastOrderDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
    public Double getAvgOrderValue() { return avgOrderValue; }
    public void setAvgOrderValue(Double avgOrderValue) { this.avgOrderValue = avgOrderValue; }
    public java.time.LocalDateTime getLastOrderDate() { return lastOrderDate; }
    public void setLastOrderDate(java.time.LocalDateTime lastOrderDate) { this.lastOrderDate = lastOrderDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static UserResponse fromEntity(com.ah.web.entity.User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setCreatedAt(user.getCreatedAt());
        
        // Calculate stats
        long orderCount = user.getOrders() != null ? user.getOrders().size() : 0;
        double totalSpent = user.getOrders() != null ? user.getOrders().stream()
                .mapToDouble(o -> o.getTotalAmount().doubleValue())
                .sum() : 0.0;
        
        response.setTotalOrders(orderCount);
        response.setTotalSpent(totalSpent);
        response.setAvgOrderValue(orderCount > 0 ? totalSpent / orderCount : 0.0);
        
        if (user.getOrders() != null && !user.getOrders().isEmpty()) {
            response.setLastOrderDate(user.getOrders().get(user.getOrders().size() - 1).getCreatedAt());
        }
        
        response.setStatus("ACTIVE"); // Default for now
        
        return response;
    }

    public static UserResponseBuilder builder() { return new UserResponseBuilder(); }

    public static class UserResponseBuilder {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String role;
        private java.time.LocalDateTime createdAt;
        private Long totalOrders;
        private Double totalSpent;
        private Double avgOrderValue;
        private java.time.LocalDateTime lastOrderDate;
        private String status;

        public UserResponseBuilder id(Long id) { this.id = id; return this; }
        public UserResponseBuilder email(String email) { this.email = email; return this; }
        public UserResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UserResponseBuilder role(String role) { this.role = role; return this; }
        public UserResponseBuilder createdAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserResponseBuilder totalOrders(Long totalOrders) { this.totalOrders = totalOrders; return this; }
        public UserResponseBuilder totalSpent(Double totalSpent) { this.totalSpent = totalSpent; return this; }
        public UserResponseBuilder avgOrderValue(Double avgOrderValue) { this.avgOrderValue = avgOrderValue; return this; }
        public UserResponseBuilder lastOrderDate(java.time.LocalDateTime lastOrderDate) { this.lastOrderDate = lastOrderDate; return this; }
        public UserResponseBuilder status(String status) { this.status = status; return this; }

        public UserResponse build() {
            return new UserResponse(id, email, firstName, lastName, phone, role, createdAt, totalOrders, totalSpent, avgOrderValue, lastOrderDate, status);
        }
    }
}
