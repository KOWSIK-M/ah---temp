package com.ah.web.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Keep-alive service that pings itself to prevent Render's free tier
 * from spinning down due to inactivity.
 * 
 * Render detects inactivity based on incoming HTTP requests, so we must
 * actually hit an endpoint to stay awake.
 * 
 * Runs every 10 minutes (Render spins down after 15 minutes of inactivity).
 */
@Service
public class KeepAliveService {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);

    @Value("${BACKEND_URL:}")
    private String backendUrl;

    private final RestTemplate restTemplate;

    public KeepAliveService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Pings the health endpoint every 10 minutes to keep the service alive.
     * Only runs when BACKEND_URL is set (on Render deployment).
     */
    @Scheduled(fixedRate = 600000) // 10 minutes in milliseconds
    public void keepAlive() {
        if (backendUrl == null || backendUrl.isBlank()) {
            logger.debug("BACKEND_URL not set, skipping keep-alive ping (local dev)");
            return;
        }

        String healthUrl = backendUrl + "/actuator/health";
        
        try {
            restTemplate.getForObject(healthUrl, String.class);
            logger.info("💓 Keep-alive ping successful: {}", healthUrl);
        } catch (Exception e) {
            logger.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
