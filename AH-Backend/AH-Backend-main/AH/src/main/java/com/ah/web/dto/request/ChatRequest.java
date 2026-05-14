package com.ah.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ChatRequest {

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 1000, message = "Message too long (max 1000 characters)")
    private String message;

    /** Optional conversation history so Claude can maintain context across turns */
    private List<ChatTurn> history;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatTurn> getHistory() { return history; }
    public void setHistory(List<ChatTurn> history) { this.history = history; }

    public record ChatTurn(String role, String content) {}
}
