//package com.PeerProbeAI.server.dto.request;
//
//import javax.validation.constraints.NotNull;
//
//public class DocumentUpdateRequest {
//
//    @NotNull(message = "Document ID cannot be null")
//    private Long documentId;
//
//    @NotNull(message = "Content cannot be null")
//    private String content;
//
//    @NotNull(message = "Room ID cannot be null")
//    private Long roomId;
//
//    public DocumentUpdateRequest() {}
//
//    public DocumentUpdateRequest(Long documentId, String content, Long roomId) {
//        this.documentId = documentId;
//        this.content = content;
//        this.roomId = roomId;
//    }
//
//    // Getters and Setters
//    public Long getDocumentId() {
//        return documentId;
//    }
//
//    public void setDocumentId(Long documentId) {
//        this.documentId = documentId;
//    }
//
//    public String getContent() {
//        return content;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
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