package com.ah.web.controller;

import com.ah.web.dto.request.ContactRequest;
import com.ah.web.dto.response.MessageResponse;
import com.ah.web.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendContactMessage(@Valid @RequestBody ContactRequest request) {
        try {
            emailService.sendContactEmail(request);
            return ResponseEntity.ok(MessageResponse.of("Message sent successfully! We'll get back to you soon."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(MessageResponse.of("Failed to send message. Please try again later."));
        }
    }
}
