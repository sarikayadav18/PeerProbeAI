package com.PeerProbeAI.server.websocket.message;

public class DocumentUpdateMessage {
    private Long documentId;
    private String content;
    private String username;
    private Long timestamp;

    public DocumentUpdateMessage() {
    }

    public DocumentUpdateMessage(Long documentId, String content, String username, Long timestamp) {
        this.documentId = documentId;
        this.content = content;
        this.username = username;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getDocumentId() {
        return documentId;
    }

    public String getContent() {
        return content;
    }

    public String getUsername() {
        return username;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "DocumentUpdateMessage{" +
                "documentId=" + documentId +
                ", content='" + content + '\'' +
                ", username='" + username + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}