//package com.PeerProbeAI.server.dto.request;
//
//import javax.validation.constraints.Min;
//import javax.validation.constraints.NotNull;
//
//public class CursorPositionRequest {
//
//    @NotNull(message = "Position cannot be null")
//    @Min(value = 0, message = "Position cannot be negative")
//    private Integer position;
//
//    @NotNull(message = "Room ID cannot be null")
//    private Long roomId;
//
//    public CursorPositionRequest() {}
//
//    public CursorPositionRequest(Integer position, Long roomId) {
//        this.position = position;
//        this.roomId = roomId;
//    }
//
//    // Getters and Setters
//    public Integer getPosition() {
//        return position;
//    }
//
//    public void setPosition(Integer position) {
//        this.position = position;
//    }
//
//    public Long getRoomId() {
//        return roomId;
//    }
//
//    public void setRoomId(Long roomId) {
//        this.roomId = roomId;
//    }
//}