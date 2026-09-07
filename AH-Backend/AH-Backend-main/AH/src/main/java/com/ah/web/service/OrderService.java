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
        ALLOWED_TRANSITIONS.put(OrderStatus.CANCELLED,  EnumSet.of(OrderStatus.REFUNDED));
        ALLOWED_TRANSITIONS.put(OrderStatus.REFUNDED,   EnumSet.noneOf(OrderStatus.class));
    }

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final EmailService emailService;
    private final PaymentGateway gateway;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        AddressRepository addressRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        CouponService couponService,
                        EmailService emailService, PaymentGateway gateway) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.couponService = couponService;
        this.emailService = emailService;
        this.gateway = gateway;
    }

    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        if (request.getRazorpayPaymentId() != null) throw new BadRequestException("Payment IDs are accepted only by the verification endpoint");
        if (!"COD".equalsIgnoreCase(request.getPaymentMethod())) throw new BadRequestException("Use online checkout for Razorpay payments");
        return createPendingOrder(userId, request, "COD");
    }

    @Transactional
    public OrderResponse createPendingOrder(Long userId, CreateOrderRequest request, String method) {
        User user = userRepository.lockById(userId)
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
                .paymentMethod(method)
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
                    .productImageUrl(product.getImageUrl() == null ? "" : product.getImageUrl())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            order.addItem(orderItem);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        // ── Apply coupon discount (increments usedCount inside the same txn) ──
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null) {
            discountAmount = couponService.applyToOrder(couponCode, subtotal);
            order.setCouponCode(couponCode.toUpperCase());
            order.setDiscountAmount(discountAmount);
        }

        var quote = CheckoutPricing.calculate(subtotal, discountAmount, method);
        if (request.getExpectedTotal()!=null && request.getExpectedTotal().compareTo(quote.totalAmount())!=0)
            throw new BadRequestException("Checkout total changed. Refresh checkout before paying.");
        order.setShippingCharges(quote.shippingCharges());
        order.setCodCharges(quote.codCharges());
        order.setTaxAmount(BigDecimal.ZERO);
        order.setDiscountAmount(discountAmount);
        order.setPaymentStatus("COD".equals(method) ? "UNPAID" : "AWAITING_PAYMENT");
        order.setTotalAmount(quote.totalAmount());
        order = orderRepository.save(order);

        cart.clearItems();
        cartRepository.save(cart);

        // ── Send order confirmation email (best-effort, never fails the request) ──
        final Order savedOrder = order;
        try {
            if ("COD".equals(method)) emailService.sendOrderConfirmationEmail(savedOrder);
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
        Order order = orderRepository.lockById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (request.getStatus() == order.getStatus()) return OrderResponse.fromEntity(order);
        validateStatusTransition(order.getStatus(), request.getStatus());
        if ("RAZORPAY".equals(order.getPaymentMethod()) && !"PAID".equals(order.getPaymentStatus())
                && request.getStatus() != OrderStatus.CANCELLED && request.getStatus() != OrderStatus.REFUNDED)
            throw new BadRequestException("Online payment must be verified first");
        if (request.getStatus() == OrderStatus.CANCELLED) {
            if ("RAZORPAY".equals(order.getPaymentMethod())) {
                if (order.getPaymentId() == null && order.getGatewayOrderId() != null) {
                    var payments=gateway.paymentsForOrder(order.getGatewayOrderId());
                    if (payments.stream().anyMatch(p->"authorized".equals(p.status())))
                        throw new BadRequestException("Payment is still processing. Please retry cancellation shortly.");
                    payments.stream().filter(p->"captured".equals(p.status())).findFirst().ifPresent(p->{
                        if (!"INR".equals(p.currency()) || p.amount()!=order.getTotalAmount().movePointRight(2).longValueExact())
                            throw new BadRequestException("Payment requires support review");
                        order.setPaymentId(p.id());
                    });
                }
                if (order.getPaymentId() != null) order.setPaymentStatus(gateway.refund(order.getPaymentId(),order.getId(),order.getTotalAmount()));
                else order.setPaymentStatus("CANCELLED");
            }
            restoreStock(order);
        }
        if (request.getStatus() == OrderStatus.REFUNDED) {
            if (!"RAZORPAY".equals(order.getPaymentMethod()) || order.getPaymentId() == null)
                throw new BadRequestException("COD refunds must be settled offline; do not mark as refunded automatically");
            order.setPaymentStatus(gateway.refund(order.getPaymentId(), order.getId(), order.getTotalAmount()));
            if (!"REFUNDED".equals(order.getPaymentStatus())) return OrderResponse.fromEntity(orderRepository.save(order));
        }
        if (request.getStatus() == OrderStatus.DELIVERED && "COD".equals(order.getPaymentMethod())) order.setPaymentStatus("PAID");

        order.setStatus(request.getStatus());
        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long id) {
        Order order = orderRepository.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!order.getUser().getId().equals(userId)) throw new BadRequestException("Order not found");
        UpdateOrderStatusRequest request = new UpdateOrderStatusRequest();
        request.setStatus(OrderStatus.CANCELLED);
        return updateOrderStatus(id, request);
    }

    @Transactional
    public OrderResponse requestReturn(Long userId, Long id, String reason) {
        Order order = orderRepository.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!order.getUser().getId().equals(userId)) throw new BadRequestException("Order not found");
        if (order.getStatus() != OrderStatus.DELIVERED) throw new BadRequestException("Only delivered orders can be returned");
        if (order.getReturnRequestedAt() == null) {
            order.setReturnReason(reason.trim());
            order.setReturnRequestedAt(java.time.LocalDateTime.now());
        }
        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    /**
     * Releases inventory and coupon reservations from abandoned online checkouts.
     * A later captured gateway callback is still reconciled and refunded by PaymentService.
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelayString = "${checkout.expiry-check-ms:900000}")
    @Transactional
    public void expireAbandonedOnlineCheckouts() {
        var deadline = java.time.LocalDateTime.now().minusMinutes(30);
        for (Order candidate : orderRepository.findExpiredPendingPayments(
                OrderStatus.PENDING, "RAZORPAY", "AWAITING_PAYMENT", deadline)) {
            Order order = orderRepository.lockById(candidate.getId()).orElse(null);
            if (order == null || order.getStatus() != OrderStatus.PENDING
                    || !"AWAITING_PAYMENT".equals(order.getPaymentStatus())) {
                continue;
            }
            order.setStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus("EXPIRED");
            restoreStock(order);
            orderRepository.save(order);
        }
    }

    private void restoreStock(Order order) {
        if (order.isStockRestored()) return;
        for (OrderItem item : order.getItems()) productRepository.restoreStock(item.getProduct().getId(), item.getQuantity());
        couponService.releaseReservation(order.getCouponCode());
        order.setStockRestored(true);
    }

    @Transactional(readOnly = true)
    public CheckoutPricing.Quote quote(Long userId, String coupon, String method) {
        Cart cart = cartRepository.findByUserIdWithItems(userId).orElseThrow(() -> new BadRequestException("Cart is empty"));
        if (cart.getItems().isEmpty()) throw new BadRequestException("Cart is empty");
        BigDecimal subtotal = cart.getItems().stream().map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discount = BigDecimal.ZERO;
        if (coupon != null && !coupon.isBlank()) {
            var validation = couponService.validateForOrder(coupon, subtotal);
            if (validation == null || !validation.isValid()) throw new BadRequestException("Coupon is no longer valid");
            discount = validation.getDiscountAmount();
        }
        if (!"COD".equalsIgnoreCase(method) && !"RAZORPAY".equalsIgnoreCase(method)) throw new BadRequestException("Invalid payment method");
        return CheckoutPricing.calculate(subtotal, discount, method);
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
