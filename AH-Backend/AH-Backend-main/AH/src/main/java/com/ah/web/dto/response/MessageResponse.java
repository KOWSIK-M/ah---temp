package com.ah.web.dto.response;

public class MessageResponse {
    
    private String message;

    public MessageResponse() {}

    public MessageResponse(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public static MessageResponse of(String message) {
        return new MessageResponse(message);
    }
}
