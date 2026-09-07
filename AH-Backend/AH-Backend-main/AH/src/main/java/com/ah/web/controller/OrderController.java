package com.ah.web.controller;

import com.ah.web.dto.request.CreateOrderRequest;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.entity.User;
import com.ah.web.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(user.getId(), request));
    }

    public record ReturnRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=1000) String reason) {}
    @PostMapping("/{orderId}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal User user, @PathVariable Long orderId) {
        return orderService.cancelOrder(user.getId(), orderId);
    }
    @PostMapping("/{orderId}/return")
    public OrderResponse requestReturn(@AuthenticationPrincipal User user, @PathVariable Long orderId, @Valid @RequestBody ReturnRequest request) {
        return orderService.requestReturn(user.getId(), orderId, request.reason());
    }
    @PostMapping("/quote")
    public com.ah.web.service.CheckoutPricing.Quote quote(@AuthenticationPrincipal User user, @RequestBody CreateOrderRequest request) {
        return orderService.quote(user.getId(), request.getCouponCode(), request.getPaymentMethod());
    }

    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId(), pageable));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(user.getId(), orderId));
    }
}
