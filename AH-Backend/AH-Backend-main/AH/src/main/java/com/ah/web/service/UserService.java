package com.ah.web.service;

import com.ah.web.dto.request.UpdateProfileRequest;
import com.ah.web.dto.response.UserResponse;
import com.ah.web.entity.User;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserResponse> getAllCustomers(String search, String filter, org.springframework.data.domain.Pageable pageable) {
        return userRepository.findAll(customerFilter(search,filter),pageable).map(UserResponse::fromEntity);
    }

    private org.springframework.data.jpa.domain.Specification<User> customerFilter(String search,String filter) {
        return (root,query,cb)->{
            var rules=new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            rules.add(cb.equal(root.get("role"),com.ah.web.entity.Role.CUSTOMER));
            if(search!=null&&!search.isBlank()) {
                String value="%"+search.trim().toLowerCase(java.util.Locale.ROOT)+"%";
                rules.add(cb.or(cb.like(cb.lower(root.get("firstName")),value),cb.like(cb.lower(root.get("lastName")),value),cb.like(cb.lower(root.get("email")),value),cb.like(root.get("phone"),value)));
            }
            if("NEW_THIS_MONTH".equals(filter)) rules.add(cb.greaterThanOrEqualTo(root.get("createdAt"),java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay()));
            if("ACTIVE".equals(filter)||"INACTIVE".equals(filter)) {
                var sub=query.subquery(Long.class); var order=sub.from(com.ah.web.entity.Order.class);
                sub.select(order.get("id")).where(cb.equal(order.get("user"),root),cb.greaterThanOrEqualTo(order.get("createdAt"),java.time.LocalDateTime.now().minusDays(30)));
                rules.add("ACTIVE".equals(filter)?cb.exists(sub):cb.not(cb.exists(sub)));
            }
            if("HIGH_VALUE".equals(filter)) {
                var sub=query.subquery(java.math.BigDecimal.class); var order=sub.from(com.ah.web.entity.Order.class);
                sub.select(cb.sum(order.<java.math.BigDecimal>get("totalAmount"))).where(cb.equal(order.get("user"),root),cb.equal(order.get("paymentStatus"),"PAID"));
                rules.add(cb.greaterThanOrEqualTo(sub,new java.math.BigDecimal("5000")));
            }
            return cb.and(rules.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    @Transactional(readOnly=true)
    public java.util.Map<String,Object> getCustomerStats(String filter) {
        var customers=userRepository.findAll(customerFilter(null,filter));
        long total=customers.size();
        long active=customers.stream().filter(u->u.getOrders().stream().anyMatch(o->o.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusDays(30)))).count();
        long fresh=customers.stream().filter(u->u.getCreatedAt().isAfter(java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay())).count();
        long orders=customers.stream().mapToLong(u->u.getOrders().size()).sum();
        java.math.BigDecimal revenue=customers.stream().flatMap(u->u.getOrders().stream()).filter(o->"PAID".equals(o.getPaymentStatus()))
            .map(com.ah.web.entity.Order::getTotalAmount).reduce(java.math.BigDecimal.ZERO,java.math.BigDecimal::add);
        return java.util.Map.of("totalCustomers",total,"activeCustomers",active,"newThisMonth",fresh,
            "avgOrdersPerCustomer",total==0?0.0:(double)orders/total,"totalRevenue",revenue);
    }
}
