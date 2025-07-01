package com.PeerProbeAI.server.model;

import java.util.List;

public class CollabOperation {
    public enum OperationType {
        INSERT,
        DELETE,
        CURSOR_UPDATE,
        SELECTION_UPDATE
    }

    private OperationType type;
    private int position;
    private String text;
    private int length;
    private String userId;
    private long revision;
    private List<CollabOperation> history;

    // Default constructor for JSON deserialization
    public CollabOperation() {}

    // Constructor for insert operations
    public CollabOperation(OperationType type, int position, String text, String userId, long revision) {
        this.type = type;
        this.position = position;
        this.text = text;
        this.userId = userId;
        this.revision = revision;
    }

    // Constructor for delete operations
    public CollabOperation(OperationType type, int position, int length, String userId, long revision) {
        this.type = type;
        this.position = position;
        this.length = length;
        this.userId = userId;
        this.revision = revision;
    }

    // Getters and Setters
    public OperationType getType() {
        return type;
    }

    public void setType(OperationType type) {
        this.type = type;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public long getRevision() {
        return revision;
    }

    public void setRevision(long revision) {
        this.revision = revision;
    }

    public List<CollabOperation> getHistory() {
        return history;
    }

    public void setHistory(List<CollabOperation> history) {
        this.history = history;
    }

    @Override
    public String toString() {
        return "CollabOperation{" +
                "type=" + type +
                ", position=" + position +
                ", text='" + text + '\'' +
                ", length=" + length +
                ", userId='" + userId + '\'' +
                ", revision=" + revision +
                '}';
    }
}