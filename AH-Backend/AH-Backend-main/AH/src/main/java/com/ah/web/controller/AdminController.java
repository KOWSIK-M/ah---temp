package com.ah.web.controller;

import com.ah.web.dto.request.CouponRequest;
import com.ah.web.dto.request.ProductCreateRequest;
import com.ah.web.dto.request.ProductUpdateRequest;
import com.ah.web.dto.request.UpdateOrderStatusRequest;
import com.ah.web.dto.response.CouponResponse;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.dto.response.ProductResponse;
import com.ah.web.dto.response.UserResponse;
import com.ah.web.service.CloudinaryService;
import com.ah.web.service.CouponService;
import com.ah.web.service.OrderService;
import com.ah.web.service.ProductService;
import com.ah.web.service.UserService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final CloudinaryService cloudinaryService;
    private final UserService userService;
    private final CouponService couponService;

    public AdminController(ProductService productService, OrderService orderService,
                           CloudinaryService cloudinaryService, UserService userService,
                           CouponService couponService) {
        this.productService = productService;
        this.orderService = orderService;
        this.cloudinaryService = cloudinaryService;
        this.userService = userService;
        this.couponService = couponService;
    }

    // Product Management
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(required = false) com.ah.web.entity.OrderStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        // Resolve named date range server-side (avoids client timezone drift)
        if (dateRange != null && startDate == null) {
            LocalDateTime now = LocalDateTime.now();
            LocalDate today = LocalDate.now();
            startDate = switch (dateRange) {
                case "TODAY"        -> today.atStartOfDay();
                case "YESTERDAY"    -> today.minusDays(1).atStartOfDay();
                case "LAST_7_DAYS"  -> today.minusDays(7).atStartOfDay();
                case "LAST_30_DAYS" -> today.minusDays(30).atStartOfDay();
                case "THIS_MONTH"   -> today.withDayOfMonth(1).atStartOfDay();
                default             -> null;
            };
            endDate = switch (dateRange) {
                case "YESTERDAY" -> today.atStartOfDay().minusSeconds(1);
                default          -> now;
            };
        }

        return ResponseEntity.ok(orderService.getAllOrders(status, search, startDate, endDate, pageable));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderByIdAdmin(orderId));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    // Image Upload
    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) throws IOException {
        String url = cloudinaryService.uploadImage(file, folder, List.of());
        return ResponseEntity.ok(Map.of("url", url));
    }

    // List all products for admin
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stockStatus,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(categoryId, search, stockStatus, pageable));
    }

    // Dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalProducts", productService.getTotalProductCount());
        stats.put("totalOrders", orderService.getTotalOrderCount());
        stats.put("totalRevenue", orderService.getTotalRevenue());
        stats.put("totalCustomers", orderService.getTotalCustomers());
        stats.put("pendingOrders", orderService.getPendingOrdersCount());
        stats.put("lowStockProducts", productService.getLowStockCount());
        stats.put("outOfStockProducts", productService.getOutOfStockCount());
        stats.put("deliveredOrders", orderService.getDeliveredOrdersCount());
        stats.put("avgOrderValue", orderService.getAverageOrderValue());
        
        // New real data
        stats.put("lowStockList", productService.getLowStockProducts(5));
        stats.put("recentOrders", orderService.getRecentOrders());
        
        return ResponseEntity.ok(stats);
    }

    
    // Customer Management
    @GetMapping("/customers")
    public ResponseEntity<Page<UserResponse>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String filter,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(userService.getAllCustomers(search, filter, pageable));
    }

    @GetMapping("/customers/stats")
    public ResponseEntity<java.util.Map<String, Object>> getCustomerStats(
            @RequestParam(required = false) String filter) {
        return ResponseEntity.ok(userService.getCustomerStats(filter));
    }

    // ── Coupon Management (/api/admin/coupons) ───────────────────

    @GetMapping("/coupons")
    public ResponseEntity<Page<CouponResponse>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(couponService.getAll(pageable));
    }

    @GetMapping("/coupons/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getById(id));
    }

    @PostMapping("/coupons")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(request));
    }

    @PutMapping("/coupons/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.update(id, request));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
