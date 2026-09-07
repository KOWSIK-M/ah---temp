package com.ah.web.service;
import com.ah.web.dto.request.*;
import com.ah.web.dto.response.OrderResponse;
import com.ah.web.entity.*;
import com.ah.web.exception.BadRequestException;
import com.ah.web.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
@Service
public class PaymentService {
    private final OrderService orders;
    private final OrderRepository repository;
    private final PaymentGateway gateway;
    private final EmailService email;
    public PaymentService(OrderService orders, OrderRepository repository, PaymentGateway gateway, EmailService email) {
        this.orders = orders; this.repository = repository; this.gateway = gateway; this.email = email;
    }
    public record StartRequest(Long shippingAddressId, String couponCode, Long orderId, java.math.BigDecimal expectedTotal) {}
    @Transactional
    public Map<String, Object> start(Long userId, StartRequest request) {
        Long orderId = request.orderId();
        if (orderId == null) {
            if (request.shippingAddressId() == null) throw new BadRequestException("Shipping address is required");
            CreateOrderRequest orderRequest = new CreateOrderRequest(request.shippingAddressId(), "RAZORPAY", request.couponCode());
            orderRequest.setExpectedTotal(request.expectedTotal());
            orderId = orders.createPendingOrder(userId, orderRequest, "RAZORPAY").getId();
        }
        Order order = repository.lockById(orderId).orElseThrow(() -> new BadRequestException("Order not found"));
        requireOwner(order, userId);
        if (!"RAZORPAY".equals(order.getPaymentMethod()) || !"AWAITING_PAYMENT".equals(order.getPaymentStatus()) || order.getStatus() != OrderStatus.PENDING)
            throw new BadRequestException("This order is not awaiting payment");
        if (order.getGatewayOrderId() == null) {
            order.setGatewayOrderId(gateway.createOrder(order.getId(), order.getTotalAmount()));
            repository.saveAndFlush(order);
        }
        return Map.of("orderId", order.getId(), "razorpayOrderId", order.getGatewayOrderId(),
                "amount", order.getTotalAmount().movePointRight(2).longValueExact(), "currency", "INR", "keyId", gateway.keyId());
    }
    @Transactional
    public OrderResponse verify(Long userId, VerifyPaymentRequest request) {
        Order existing = repository.findByGatewayOrderId(request.getRazorpayOrderId()).orElseThrow(() -> new BadRequestException("Unknown checkout"));
        Order order = repository.lockById(existing.getId()).orElseThrow();
        requireOwner(order, userId);
        if (!gateway.verifySignature(order.getGatewayOrderId() + "|" + request.getRazorpayPaymentId(), request.getRazorpaySignature(), false))
            throw new BadRequestException("Payment signature verification failed");
        return confirm(order, gateway.fetchPayment(request.getRazorpayPaymentId()));
    }
    @Transactional
    public void webhook(String body, String signature) {
        if (!gateway.verifySignature(body, signature, true)) throw new BadRequestException("Invalid webhook signature");
        var event = new org.json.JSONObject(body);
        if ("refund.processed".equals(event.optString("event"))) {
            String paymentId=event.getJSONObject("payload").getJSONObject("refund").getJSONObject("entity").getString("payment_id");
            var existingRefund=repository.findByPaymentId(paymentId);
            if(existingRefund.isPresent()) {
                Order refundOrder=repository.lockById(existingRefund.get().getId()).orElseThrow();
                if(gateway.isFullyRefunded(paymentId,refundOrder.getTotalAmount())) {
                    refundOrder.setPaymentStatus("REFUNDED");
                    if(refundOrder.getStatus()==OrderStatus.DELIVERED) refundOrder.setStatus(OrderStatus.REFUNDED);
                    repository.save(refundOrder);
                }
            }
            return;
        }
        if (!"payment.captured".equals(event.optString("event"))) return;
        var payment = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        var existing = repository.findByGatewayOrderId(payment.optString("order_id"));
        if (existing.isEmpty()) return;
        Order order = repository.lockById(existing.get().getId()).orElseThrow();
        confirm(order, gateway.fetchPayment(payment.getString("id")));
    }
    private OrderResponse confirm(Order order, PaymentGateway.Payment payment) {
        if (!order.getGatewayOrderId().equals(payment.orderId()) || !"INR".equals(payment.currency())
                || payment.amount() != order.getTotalAmount().movePointRight(2).longValueExact() || !"captured".equals(payment.status()))
            throw new BadRequestException("Payment is not captured for this checkout amount");
        if (order.getStatus() == OrderStatus.CANCELLED) {
            order.setPaymentId(payment.id());
            order.setPaymentStatus(gateway.refund(payment.id(),order.getId(),order.getTotalAmount()));
            return OrderResponse.fromEntity(repository.save(order));
        }
        if (order.getPaymentId() != null) {
            if (!order.getPaymentId().equals(payment.id())) throw new BadRequestException("Checkout already has a different payment");
            return OrderResponse.fromEntity(order);
        }
        if (repository.findByPaymentId(payment.id()).isPresent()) throw new BadRequestException("Payment already used");
        if (order.getStatus() != OrderStatus.PENDING) throw new BadRequestException("Order cannot accept payment");
        order.setPaymentId(payment.id()); order.setPaymentStatus("PAID"); order.setStatus(OrderStatus.CONFIRMED);
        repository.saveAndFlush(order);
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
            new org.springframework.transaction.support.TransactionSynchronization() {
                @Override public void afterCommit() {
                    try { email.sendOrderConfirmationEmail(order); } catch (Exception ignored) { }
                }
            });
        return OrderResponse.fromEntity(order);
    }
    private void requireOwner(Order order, Long userId) {
        if (!order.getUser().getId().equals(userId)) throw new BadRequestException("Order not found");
    }
}
