package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.model.CollabOperation;
import com.PeerProbeAI.server.security.JwtUtils;
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

import java.security.Principal;
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
            CursorUpdateRequest cursorUpdate,
            @Header("simpUser") Authentication authentication) {

        logger.debug("Received cursor update for doc {}: {}", docId, cursorUpdate);

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated user attempted cursor update on doc {}", docId);
            return;
        }

        String username = authentication.getName();
        logger.debug("Broadcasting cursor position from user {} for doc {}", username, docId);

        messagingTemplate.convertAndSend(
                String.format("/topic/document/%s/cursor", docId),
                new CursorUpdateResponse(
                        cursorUpdate.getUserId(),
                        cursorUpdate.getPosition(),
                        cursorUpdate.getSelection(),
                        cursorUpdate.getTimestamp()
                )
        );
    }

    @MessageMapping("/document/{docId}/participants")
    public void getParticipants(
            @DestinationVariable String docId,
            @AuthenticationPrincipal Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated user requested participants for doc {}", docId);
            return;
        }

        Integer userId = null;

        Object principal = authentication.getPrincipal();
        if (principal instanceof JwtUtils.UserDetails userDetails) {
            userId = userDetails.getUserId();
            logger.info("Authenticated user requesting participants: username = {}, userId = {}", userDetails.getUsername(), userId);
        } else {
            logger.info("Authenticated user requesting participants: {}", authentication.getName());
        }

        try {
            collabService.addParticipant(docId,userId.toString());
            String[] participants = collabService.getDocumentParticipants(docId);

            logger.debug("Returning {} participants for doc {}", participants.length, docId);

            messagingTemplate.convertAndSend(
                    String.format("/topic/document/%s/participants", docId),
                    participants
            );
        } catch (Exception e) {
            logger.error("Error getting participants for doc {}: {}", docId, e.getMessage(), e);
        }
    }



    // Request DTO for cursor updates
    public static class CursorUpdateRequest {
        private Position position;
        private Selection selection;
        private Long userId;
        private Long timestamp;

        // Getters and setters
        public Position getPosition() { return position; }
        public void setPosition(Position position) { this.position = position; }
        public Selection getSelection() { return selection; }
        public void setSelection(Selection selection) { this.selection = selection; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
    }

    // Response DTO for cursor updates
    public static class CursorUpdateResponse {
        private final Long userId;
        private final Position position;
        private final Selection selection;
        private final Long timestamp;

        public CursorUpdateResponse(Long userId, Position position, Selection selection, Long timestamp) {
            this.userId = userId;
            this.position = position;
            this.selection = selection;
            this.timestamp = timestamp;
        }

        // Getters
        public Long getUserId() { return userId; }
        public Position getPosition() { return position; }
        public Selection getSelection() { return selection; }
        public Long getTimestamp() { return timestamp; }
    }

    public static class Position {
        private int lineNumber;
        private int column;

        // Getters and setters
        public int getLineNumber() { return lineNumber; }
        public void setLineNumber(int lineNumber) { this.lineNumber = lineNumber; }
        public int getColumn() { return column; }
        public void setColumn(int column) { this.column = column; }
    }

    public static class Selection {
        private int startLineNumber;
        private int startColumn;
        private int endLineNumber;
        private int endColumn;

        // Getters and setters
        public int getStartLineNumber() { return startLineNumber; }
        public void setStartLineNumber(int startLineNumber) { this.startLineNumber = startLineNumber; }
        public int getStartColumn() { return startColumn; }
        public void setStartColumn(int startColumn) { this.startColumn = startColumn; }
        public int getEndLineNumber() { return endLineNumber; }
        public void setEndLineNumber(int endLineNumber) { this.endLineNumber = endLineNumber; }
        public int getEndColumn() { return endColumn; }
        public void setEndColumn(int endColumn) { this.endColumn = endColumn; }

        public boolean isEmpty() {
            return startLineNumber == endLineNumber && startColumn == endColumn;
        }
    }
}