package com.PeerProbeAI.server.dto.video;

public class SignalMessage {
    private String type; // "offer", "answer", "candidate"
    private Long senderId;  // Changed to Long
    private Long receiverId; // Changed to Long
    private Object payload; // SDP or ICE candidate

    // No-args constructor
    public SignalMessage() {
    }

    // All-args constructor
    public SignalMessage(String type, Long senderId, Long receiverId, Object payload) {
        this.type = type;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.payload = payload;
    }

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}