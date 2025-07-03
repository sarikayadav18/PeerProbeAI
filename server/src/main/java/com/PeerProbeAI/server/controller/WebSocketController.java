package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.model.CollabOperation;
import com.PeerProbeAI.server.service.CollabService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.util.Arrays;

@Controller
public class WebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final CollabService collabService;

    @Autowired
    public WebSocketController(SimpMessagingTemplate messagingTemplate, CollabService collabService) {
        this.messagingTemplate = messagingTemplate;
        this.collabService = collabService;
        logger.info("WebSocketController initialized");
    }

    @MessageMapping("/document/{docId}/edit")
    @SendTo("/topic/document/{docId}")
    public CollabOperation handleEditOperation(
            @DestinationVariable String docId,
            CollabOperation operation,
            @Header("simpUser") Authentication authentication) {

        logger.debug("Received edit operation for doc {}: {}", docId, operation);

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated user attempted to edit document {}", docId);
            throw new SecurityException("Authentication required");
        }

        String username = authentication.getName();
        logger.debug("Processing operation from user {} for doc {}", username, docId);

        try {
            // Process the operation with operational transformation
            CollabOperation transformedOp = collabService.processOperation(
                    docId,
                    operation,
                    username
            );

            logger.debug("Transformed operation for doc {}: {}", docId, transformedOp);
            return transformedOp;
        } catch (Exception e) {
            logger.error("Error processing operation for doc {}: {}", docId, e.getMessage());
            logger.debug("Stack trace:", e);
            throw e;
        }
    }

    @MessageMapping("/document/{docId}/cursor")
    public void handleCursorPosition(
            @DestinationVariable String docId,
            String cursorData,
            @Header("simpUser") Authentication authentication) {

        logger.debug("Received cursor update for doc {}: {}", docId, cursorData);

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated user attempted cursor update on doc {}", docId);
            return;
        }

        String username = authentication.getName();
        logger.debug("Broadcasting cursor position from user {} for doc {}", username, docId);

        messagingTemplate.convertAndSend(
                String.format("/topic/document/%s/cursor", docId),
                new CursorUpdate(username, cursorData)
        );
    }

    @MessageMapping("/document/{docId}/participants")
    public String[] getParticipants(
            @DestinationVariable String docId,
            @AuthenticationPrincipal Authentication authentication) {

        logger.info("Received participants for doc {}: {}", docId, authentication.getName());

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated user requested participants for doc {}", docId);
            return new String[0];
        }

        try {
            String[] participants = collabService.getDocumentParticipants(docId);
            logger.debug("Returning {} participants for doc {}", participants.length, docId);
            return participants;
        } catch (Exception e) {
            logger.error("Error getting participants for doc {}: {}", docId, e.getMessage());
            return new String[0];
        }
    }

    // Inner class for cursor updates
    private static class CursorUpdate {
        private final String userId;
        private final String cursorData;

        public CursorUpdate(String userId, String cursorData) {
            this.userId = userId;
            this.cursorData = cursorData;
        }

        public String getUserId() { return userId; }
        public String getCursorData() { return cursorData; }

        @Override
        public String toString() {
            return "CursorUpdate{" +
                    "userId='" + userId + '\'' +
                    ", cursorData='" + cursorData + '\'' +
                    '}';
        }
    }
}
