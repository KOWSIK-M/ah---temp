package com.ah.web.service;

import com.ah.web.dto.request.CreateOrderRequest;
import com.ah.web.dto.request.UpdateOrderStatusRequest;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.entity.*;
import com.ah.web.exception.BadRequestException;
import com.ah.web.exception.ResourceNotFoundException;
import com.ah.web.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderService {

    // Explicit allowed transitions — safe against enum reordering
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS;
    static {
        ALLOWED_TRANSITIONS = new EnumMap<>(OrderStatus.class);
        ALLOWED_TRANSITIONS.put(OrderStatus.PENDING,    EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.CONFIRMED,  EnumSet.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.PROCESSING, EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.SHIPPED,    EnumSet.of(OrderStatus.DELIVERED));
        ALLOWED_TRANSITIONS.put(OrderStatus.DELIVERED,  EnumSet.of(OrderStatus.REFUNDED));
        ALLOWED_TRANSITIONS.put(OrderStatus.CANCELLED,  EnumSet.noneOf(OrderStatus.class));
        ALLOWED_TRANSITIONS.put(OrderStatus.REFUNDED,   EnumSet.noneOf(OrderStatus.class));
    }

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        AddressRepository addressRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        CouponService couponService,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.couponService = couponService;
        this.emailService = emailService;
    }

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getShippingAddressId()));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Invalid shipping address");
        }

        // ── Coupon: validate before touching stock ──────────────────────────
        String couponCode = request.getCouponCode();
        if (couponCode != null && couponCode.isBlank()) couponCode = null;

        Order order = Order.builder()
                .user(user)
                .shippingAddress(address)
                .shippingAddressSnapshot(formatAddress(address))
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            // Atomic decrement — returns 0 if stock was insufficient (race-condition safe)
            int updated = productRepository.decrementStock(product.getId(), cartItem.getQuantity());
            if (updated == 0) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .productImageUrl(product.getImageUrl())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            order.addItem(orderItem);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        // ── Apply coupon discount (increments usedCount inside the same txn) ──
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null) {
            // Re-validate with final subtotal — prevents race between validate and place-order
            var validation = couponService.validateForOrder(couponCode, subtotal);
            if (validation == null || !validation.isValid()) {
                throw new BadRequestException(
                    validation != null ? validation.getMessage() : "Invalid coupon code"
                );
            }
            discountAmount = couponService.applyToOrder(couponCode, subtotal);
            order.setCouponCode(couponCode.toUpperCase());
            order.setDiscountAmount(discountAmount);
        }

        // If a verified Razorpay payment ID was provided, mark the order as confirmed + paid
        if (request.getRazorpayPaymentId() != null && !request.getRazorpayPaymentId().isBlank()) {
            order.setPaymentId(request.getRazorpayPaymentId());
            order.setPaymentStatus("PAID");
            order.setStatus(OrderStatus.CONFIRMED);
        }

        order.setTotalAmount(subtotal.subtract(discountAmount));
        order = orderRepository.save(order);

        cart.clearItems();
        cartRepository.save(cart);

        // ── Send order confirmation email (best-effort, never fails the request) ──
        final Order savedOrder = order;
        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(OrderService.class)
                .warn("Order confirmation email failed for order {}: {}", savedOrder.getId(), e.getMessage());
        }

        return OrderResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return OrderResponse.fromEntity(order);
    }

    // Admin methods
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(OrderStatus status, String search,
                                           java.time.LocalDateTime startDate,
                                           java.time.LocalDateTime endDate,
                                           Pageable pageable) {
        return orderRepository.findWithFilters(status, search, startDate, endDate, pageable)
                .map(OrderResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateStatusTransition(order.getStatus(), request.getStatus());

        order.setStatus(request.getStatus());
        order = orderRepository.save(order);

        return OrderResponse.fromEntity(order);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(next)) {
            throw new BadRequestException(
                "Invalid status transition from " + current + " to " + next +
                ". Allowed: " + allowed
            );
        }
    }

    private String formatAddress(Address address) {
        StringBuilder sb = new StringBuilder();
        sb.append(address.getFirstName()).append(" ").append(address.getLastName());
        sb.append(", ").append(address.getAddressLine1());
        if (address.getAddressLine2() != null && !address.getAddressLine2().isEmpty()) {
            sb.append(", ").append(address.getAddressLine2());
        }
        sb.append(", ").append(address.getCity());
        sb.append(", ").append(address.getState());
        sb.append(" - ").append(address.getPincode());
        sb.append(" (Phone: ").append(address.getPhone()).append(")");
        return sb.toString();
    }

    public long getTotalOrderCount() {
        return orderRepository.count();
    }

    public java.math.BigDecimal getTotalRevenue() {
        java.math.BigDecimal total = orderRepository.sumTotalRevenue();
        return total != null ? total : java.math.BigDecimal.ZERO;
    }

    public long getPendingOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }

    public long getTotalCustomers() {
        return orderRepository.countTotalCustomers();
    }

    public long getDeliveredOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.DELIVERED);
    }

    public BigDecimal getAverageOrderValue() {
        long count = getTotalOrderCount();
        if (count == 0) return BigDecimal.ZERO;
        return getTotalRevenue().divide(BigDecimal.valueOf(count), 2, java.math.RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getRecentOrders() {
        return orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
