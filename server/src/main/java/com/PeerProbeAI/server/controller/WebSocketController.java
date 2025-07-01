package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.model.CollabOperation;
import com.PeerProbeAI.server.service.CollabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final CollabService collabService;

    @Autowired
    public WebSocketController(SimpMessagingTemplate messagingTemplate, CollabService collabService) {
        this.messagingTemplate = messagingTemplate;
        this.collabService = collabService;
    }

    @MessageMapping("/document/{docId}/edit")
    @SendTo("/topic/document/{docId}")
    public CollabOperation handleEditOperation(
            @DestinationVariable String docId,
            CollabOperation operation,
            Principal principal) {

        // Process the operation with operational transformation
        CollabOperation transformedOp = collabService.processOperation(docId, operation, principal.getName());

        // Broadcast the transformed operation to all subscribers
        return transformedOp;
    }

    @MessageMapping("/document/{docId}/cursor")
    public void handleCursorPosition(
            @DestinationVariable String docId,
            String cursorData,
            Principal principal) {

        // Broadcast cursor position to all other users in the document
        messagingTemplate.convertAndSend(
                String.format("/topic/document/%s/cursor", docId),
                new CursorUpdate(principal.getName(), cursorData)
        );
    }

    @SubscribeMapping("/document/{docId}/participants")
    public String[] getParticipants(@DestinationVariable String docId) {
        return collabService.getDocumentParticipants(docId);
    }

    // Inner class for cursor updates
    private static class CursorUpdate {
        private String userId;
        private String cursorData;

        public CursorUpdate(String userId, String cursorData) {
            this.userId = userId;
            this.cursorData = cursorData;
        }

        // Getters for JSON serialization
        public String getUserId() { return userId; }
        public String getCursorData() { return cursorData; }
    }
}