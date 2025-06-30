package com.PeerProbeAI.server.websocket.message;

import java.time.LocalDateTime;

public class ChatMessage {
    private Long id;
    private String roomId;
    private String sender;
    private String content;
    private LocalDateTime timestamp;

    public ChatMessage() {}

    public ChatMessage(Long id, String roomId, String sender, String content, LocalDateTime timestamp) {
        this.id = id;
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() { return id; }
    public String getRoomId() { return roomId; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public void setSender(String sender) { this.sender = sender; }
    public void setContent(String content) { this.content = content; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id=" + id +
                ", roomId='" + roomId + '\'' +
                ", sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}