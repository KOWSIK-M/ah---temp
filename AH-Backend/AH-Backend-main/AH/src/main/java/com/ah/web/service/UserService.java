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
        org.springframework.data.domain.Page<com.ah.web.entity.User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByRoleAndSearch(com.ah.web.entity.Role.CUSTOMER, search.trim(), pageable);
        } else {
            users = userRepository.findByRole(com.ah.web.entity.Role.CUSTOMER, pageable);
        }

        // Note: filter logic (ACTIVE, HIGH_VALUE, etc.) could be added here if needed.
        // For now, we'll return the results based on search.

        return users.map(UserResponse::fromEntity);
    }

    public java.util.Map<String, Object> getCustomerStats(String filter) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        long total = userRepository.countByRole(com.ah.web.entity.Role.CUSTOMER);
        
        java.time.LocalDateTime firstOfMonth = java.time.LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
        long newThisMonth = userRepository.countByRoleAndCreatedAtAfter(com.ah.web.entity.Role.CUSTOMER, firstOfMonth);

        stats.put("totalCustomers", total);
        stats.put("activeCustomers", total); // Simplified: count all as active for now
        stats.put("newThisMonth", newThisMonth);
        stats.put("avgOrdersPerCustomer", 0.0); // Placeholder
        stats.put("totalRevenue", 0.0); // Placeholder

        return stats;
    }
}
