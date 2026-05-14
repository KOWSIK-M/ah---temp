package com.ah.web.repository;

import com.ah.web.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.orders WHERE u.role = :role",
           countQuery = "SELECT COUNT(u) FROM User u WHERE u.role = :role")
    org.springframework.data.domain.Page<User> findByRole(@org.springframework.data.repository.query.Param("role") com.ah.web.entity.Role role, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.orders WHERE u.role = :role AND (" +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "u.phone LIKE CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(u) FROM User u WHERE u.role = :role AND (" +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "u.phone LIKE CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<User> findByRoleAndSearch(@org.springframework.data.repository.query.Param("role") com.ah.web.entity.Role role, @org.springframework.data.repository.query.Param("search") String search, org.springframework.data.domain.Pageable pageable);

    long countByRole(com.ah.web.entity.Role role);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.createdAt >= :since")
    long countByRoleAndCreatedAtAfter(@org.springframework.data.repository.query.Param("role") com.ah.web.entity.Role role, @org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}
