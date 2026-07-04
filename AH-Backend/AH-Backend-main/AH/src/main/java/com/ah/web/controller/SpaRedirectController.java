package com.ah.web.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;

@Controller
@RequestMapping("/oauth2")
public class SpaRedirectController {

    @Value("${APP_OAUTH2_REDIRECT_URI:${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}}")
    private String redirectUri;

    @GetMapping("/redirect")
    public void redirectToFrontend(HttpServletResponse response) throws IOException {
        response.sendRedirect(redirectUri);
    }
}
