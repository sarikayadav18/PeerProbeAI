//package com.PeerProbeAI.server.websocket.message;
//
//public class CursorPositionMessage {
//    private String username;
//    private int position;
//    private long timestamp;
//
//    public CursorPositionMessage() {}
//
//    public CursorPositionMessage(String username, int position, long timestamp) {
//        this.username = username;
//        this.position = position;
//        this.timestamp = timestamp;
//    }
//
//    // Getters
//    public String getUsername() {
//        return username;
//    }
//
//    public int getPosition() {
//        return position;
//    }
//
//    public long getTimestamp() {
//        return timestamp;
//    }
//
//    // Setters
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public void setPosition(int position) {
//        this.position = position;
//    }
//
//    public void setTimestamp(long timestamp) {
//        this.timestamp = timestamp;
//    }
//
//    @Override
//    public String toString() {
//        return "CursorPositionMessage{" +
//                "username='" + username + '\'' +
//                ", position=" + position +
//                ", timestamp=" + timestamp +
//                '}';
//    }
//}