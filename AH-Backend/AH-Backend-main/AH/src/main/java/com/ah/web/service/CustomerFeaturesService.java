package com.ah.web.service;
import com.ah.web.dto.response.ProductResponse;
import com.ah.web.exception.BadRequestException;
import com.ah.web.repository.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class CustomerFeaturesService {
    private final JdbcTemplate db;
    private final ProductRepository products;
    private final UserRepository users;
    public CustomerFeaturesService(JdbcTemplate db, ProductRepository products, UserRepository users) {
        this.db = db; this.products = products; this.users = users;
    }
    @Transactional(readOnly=true)
    public List<ProductResponse> wishlist(Long userId) {
        List<Long> ids = db.queryForList("SELECT product_id FROM wishlist_items WHERE user_id = ? ORDER BY product_id", Long.class, userId);
        return products.findAllById(ids).stream().map(ProductResponse::fromEntity).toList();
    }
    @Transactional
    public void add(Long userId, Long productId) {
        users.lockById(userId).orElseThrow();
        if (!products.existsById(productId)) throw new BadRequestException("Product not found");
        if (db.queryForObject("SELECT COUNT(*) FROM wishlist_items WHERE user_id=? AND product_id=?", Long.class, userId, productId) == 0)
            db.update("INSERT INTO wishlist_items(user_id,product_id) VALUES (?,?)", userId, productId);
    }
    public void remove(Long userId, Long productId) {
        db.update("DELETE FROM wishlist_items WHERE user_id=? AND product_id=?", userId, productId);
    }
    public void subscribe(String email) {
        // Database uniqueness handles concurrent subscriptions without duplicate subscribers.
        try { db.update("INSERT INTO newsletter_subscriptions(email) VALUES (?)", email.trim().toLowerCase(java.util.Locale.ROOT)); }
        catch (org.springframework.dao.DuplicateKeyException ignored) { }
    }
}
