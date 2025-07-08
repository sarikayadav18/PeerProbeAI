package com.PeerProbeAI.server.dto.video;

public class CallRequest {
    private Long callerId;
    private Long calleeId;
    private String callType; // "video" or "audio"

    // No-args constructor
    public CallRequest() {
    }

    // All-args constructor
    public CallRequest(Long callerId, Long calleeId, String callType) {
        this.callerId = callerId;
        this.calleeId = calleeId;
        this.callType = callType;
    }

    // Getters and setters
    public Long getCallerId() {
        return callerId;
    }

    public void setCallerId(Long callerId) {
        this.callerId = callerId;
    }

    public Long getCalleeId() {
        return calleeId;
    }

    public void setCalleeId(Long calleeId) {
        this.calleeId = calleeId;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }
}