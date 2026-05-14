package com.ah.web.dto.response;

import java.util.List;

public class ChatResponse {

    private String reply;
    private List<ProductSuggestion> suggestions;

    public ChatResponse(String reply, List<ProductSuggestion> suggestions) {
        this.reply = reply;
        this.suggestions = suggestions;
    }

    public String getReply() { return reply; }
    public List<ProductSuggestion> getSuggestions() { return suggestions; }

    /** Lightweight product card returned alongside the chat reply */
    public record ProductSuggestion(
        Long id,
        String name,
        String imageUrl,
        java.math.BigDecimal price,
        Double rating,
        String shortDescription
    ) {}
}
