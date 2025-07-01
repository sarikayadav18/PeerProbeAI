//package com.PeerProbeAI.server.dto.request;
//
//import javax.validation.constraints.NotBlank;
//import javax.validation.constraints.Size;
//
//public class ChatMessageRequest {
//
//    @NotBlank(message = "Message content cannot be blank")
//    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
//    private String content;
//
//    // Default constructor
//    public ChatMessageRequest() {}
//
//    // Constructor with content
//    public ChatMessageRequest(String content) {
//        this.content = content;
//    }
//
//    // Getters and setters
//    public String getContent() {
//        return content;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
//    }
//}