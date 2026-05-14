package com.ah.web.service;

import com.ah.web.dto.request.ContactRequest;
import com.ah.web.entity.Order;
import com.ah.web.entity.OrderItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    
    @Value("${contact.email.to:medamkowsik2004@gmail.com}")
    private String recipientEmail;
    
    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactEmail(ContactRequest request) {
        String body = String.format(
            "New contact form submission:\n\n" +
            "Name: %s\n" +
            "Email: %s\n" +
            "Subject: %s\n\n" +
            "Message:\n%s\n\n" +
            "---\n" +
            "This message was sent from the Anjaneya Herbals website contact form.",
            request.getName(),
            request.getEmail(),
            request.getSubject(),
            request.getMessage()
        );

        // If mail sender is not configured, log the message
        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email not configured. Contact form submission logged:");
            log.info("To: {}", recipientEmail);
            log.info("From: {}", request.getEmail());
            log.info("Subject: [Anjaneya Herbals Contact] {}", request.getSubject());
            log.info("Body:\n{}", body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setFrom(fromEmail);
            message.setReplyTo(request.getEmail());
            message.setSubject("[Anjaneya Herbals Contact] " + request.getSubject());
            message.setText(body);
            mailSender.send(message);
            log.info("Contact email sent to {} from {}", recipientEmail, request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email, logging message instead: {}", e.getMessage());
            log.info("To: {}", recipientEmail);
            log.info("From: {}", request.getEmail());
            log.info("Subject: [Anjaneya Herbals Contact] {}", request.getSubject());
            log.info("Body:\n{}", body);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Order Confirmation Email
    // ─────────────────────────────────────────────────────────────────────────

    public void sendOrderConfirmationEmail(Order order) {
        if (order.getUser() == null || order.getUser().getEmail() == null) return;

        String customerEmail = order.getUser().getEmail();
        String customerName  = order.getUser().getFirstName();
        String subject       = "Order Confirmed! #" + order.getId() + " — Anjaneya Herbals";

        if (mailSender == null || fromEmail == null || fromEmail.isEmpty()) {
            log.info("Mail not configured — skipping order confirmation for order {}", order.getId());
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(customerEmail);
            helper.setFrom(fromEmail);
            helper.setSubject(subject);
            helper.setText(buildOrderConfirmationHtml(order, customerName), true);
            mailSender.send(mimeMessage);
            log.info("Order confirmation email sent to {} for order #{}", customerEmail, order.getId());
        } catch (MessagingException e) {
            log.error("Failed to send order confirmation email for order {}: {}", order.getId(), e.getMessage());
        }
    }

    private String buildOrderConfirmationHtml(Order order, String customerName) {
        StringBuilder items = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                BigDecimal lineTotal = item.getPriceAtPurchase()
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                items.append(String.format(
                    "<tr>" +
                    "  <td style='padding:8px;border-bottom:1px solid #e5e7eb;'>%s</td>" +
                    "  <td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;'>%d</td>" +
                    "  <td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;'>₹%.2f</td>" +
                    "  <td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;'>₹%.2f</td>" +
                    "</tr>",
                    item.getProductName(),
                    item.getQuantity(),
                    item.getPriceAtPurchase(),
                    lineTotal
                ));
            }
        }

        String discountRow = "";
        if (order.getDiscountAmount() != null
                && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discountRow = String.format(
                "<tr>" +
                "  <td colspan='3' style='padding:8px;text-align:right;color:#16a34a;'>Coupon (%s)</td>" +
                "  <td style='padding:8px;text-align:right;color:#16a34a;'>-₹%.2f</td>" +
                "</tr>",
                order.getCouponCode() != null ? order.getCouponCode() : "",
                order.getDiscountAmount()
            );
        }

        return "<!DOCTYPE html>" +
            "<html><body style='font-family:sans-serif;background:#f9fafb;margin:0;padding:0;'>" +
            "<div style='max-width:600px;margin:32px auto;background:#fff;border-radius:12px;" +
            "     box-shadow:0 2px 8px rgba(0,0,0,.07);overflow:hidden;'>" +

            // Header
            "<div style='background:linear-gradient(135deg,#16a34a,#ca8a04);padding:32px;text-align:center;'>" +
            "  <h1 style='color:#fff;margin:0;font-size:24px;'>🌿 Anjaneya Herbals</h1>" +
            "  <p style='color:#dcfce7;margin:8px 0 0;'>Your order is confirmed!</p>" +
            "</div>" +

            // Body
            "<div style='padding:32px;'>" +
            "  <p style='color:#374151;font-size:16px;'>Hi <strong>" + customerName + "</strong>,</p>" +
            "  <p style='color:#6b7280;'>Thank you for your order. We'll process it right away.</p>" +

            "  <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;" +
            "       padding:16px;margin:20px 0;'>" +
            "    <p style='margin:0;color:#166534;font-weight:600;'>Order #" + order.getId() + "</p>" +
            "    <p style='margin:4px 0 0;color:#16a34a;font-size:14px;'>" +
            "      Estimated delivery: 3–5 business days" +
            "    </p>" +
            "  </div>" +

            // Items table
            "  <table style='width:100%;border-collapse:collapse;font-size:14px;'>" +
            "    <thead>" +
            "      <tr style='background:#f3f4f6;'>" +
            "        <th style='padding:10px 8px;text-align:left;color:#374151;'>Product</th>" +
            "        <th style='padding:10px 8px;text-align:center;color:#374151;'>Qty</th>" +
            "        <th style='padding:10px 8px;text-align:right;color:#374151;'>Price</th>" +
            "        <th style='padding:10px 8px;text-align:right;color:#374151;'>Total</th>" +
            "      </tr>" +
            "    </thead>" +
            "    <tbody>" +
            items.toString() +
            discountRow +
            "      <tr style='font-weight:700;background:#f9fafb;'>" +
            "        <td colspan='3' style='padding:12px 8px;text-align:right;'>Order Total</td>" +
            "        <td style='padding:12px 8px;text-align:right;'>₹" +
                       String.format("%.2f", order.getTotalAmount()) + "</td>" +
            "      </tr>" +
            "    </tbody>" +
            "  </table>" +

            "  <p style='margin-top:28px;color:#6b7280;font-size:14px;'>" +
            "    If you have any questions, reply to this email or contact us at " +
            "    <a href='mailto:" + recipientEmail + "' style='color:#16a34a;'>" + recipientEmail + "</a>." +
            "  </p>" +
            "</div>" +

            // Footer
            "<div style='background:#f3f4f6;padding:20px;text-align:center;font-size:12px;color:#9ca3af;'>" +
            "  © 2025 Anjaneya Herbals · Pure Ayurveda" +
            "</div>" +

            "</div></body></html>";
    }
}
