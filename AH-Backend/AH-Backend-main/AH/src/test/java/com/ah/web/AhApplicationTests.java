package com.ah.web;
import com.ah.web.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mail.javamail.JavaMailSender;
@SpringBootTest
@ActiveProfiles("test")
class AhApplicationTests {
    @MockitoBean RagChatService chat;
    @MockitoBean ProductEmbeddingService embeddings;
    @MockitoBean PaymentGateway gateway;
    @MockitoBean JavaMailSender mail;
    @Test void contextLoads() {}
}
