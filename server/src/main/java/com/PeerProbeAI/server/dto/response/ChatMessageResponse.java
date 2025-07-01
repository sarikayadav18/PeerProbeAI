//package com.PeerProbeAI.server.dto.response;
//
//import com.PeerProbeAI.server.model.ChatMessage;
//
//
//import java.time.LocalDateTime;
//
//
//public class ChatMessageResponse {
//    private final Long id;
//    private final Long senderId;
//    private final String senderName;
//    private final String content;
//    private final LocalDateTime timestamp;
//
//    public String getContent() {
//        return content;
//    }
//
//    public Long getId() {
//        return id;
//    }
//
//    public Long getSenderId() {
//        return senderId;
//    }
//
//    public String getSenderName() {
//        return senderName;
//    }
//
//    public LocalDateTime getTimestamp() {
//        return timestamp;
//    }
//
//    public ChatMessageResponse(ChatMessage message) {
//        this.id = message.getId();
//        this.senderId = message.getSender().getId();
//        this.senderName = message.getSender().getUsername();
//        this.content = message.getContent();
//        this.timestamp = message.getTimestamp();
//    }
//}