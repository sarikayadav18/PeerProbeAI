package com.PeerProbeAI.server.websocket.handler;

import com.PeerProbeAI.server.service.CollaborationService;
import com.PeerProbeAI.server.websocket.message.DocumentUpdateMessage;
import com.PeerProbeAI.server.websocket.message.CursorPositionMessage;
import com.PeerProbeAI.server.websocket.message.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class CollaborationWebSocketHandler {

    private final CollaborationService collaborationService;

    public CollaborationWebSocketHandler(CollaborationService collaborationService) {
        this.collaborationService = collaborationService;
    }

    @MessageMapping("/room/{roomId}/document/update")
    public void handleDocumentUpdate(
            @DestinationVariable String roomId,
            DocumentUpdateMessage message,
            @Header("simpUser") Principal user) {
        collaborationService.processDocumentUpdate(roomId, message, user.getName());
    }

    @MessageMapping("/room/{roomId}/cursor/update")
    public void handleCursorUpdate(
            @DestinationVariable String roomId,
            CursorPositionMessage message,
            @Header("simpUser") Principal user) {
        collaborationService.processCursorUpdate(roomId, message, user.getName());
    }

    @MessageMapping("/room/{roomId}/chat/send")
    public void handleChatMessage(
            @DestinationVariable String roomId,
            ChatMessage message,
            @Header("simpUser") Principal user) {
        collaborationService.processChatMessage(roomId, message, user.getName());
    }
}