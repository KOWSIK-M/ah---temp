package com.ah.web.repository;

import com.ah.web.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Coupon c WHERE LOWER(c.code)=LOWER(:code)")
    Optional<Coupon> lockByCode(@org.springframework.data.repository.query.Param("code") String code);

    Optional<Coupon> findByCodeIgnoreCaseAndActiveTrue(String code);

    boolean existsByCodeIgnoreCase(String code);
}
