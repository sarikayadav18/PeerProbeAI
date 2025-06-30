package com.PeerProbeAI.server.service.impl;

import com.PeerProbeAI.server.service.CollaborationService;
import com.PeerProbeAI.server.websocket.message.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class CollaborationServiceImpl implements CollaborationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final DocumentService documentService;
    private final RoomService roomService;

    public CollaborationServiceImpl(SimpMessagingTemplate messagingTemplate,
                                    DocumentService documentService,
                                    RoomService roomService) {
        this.messagingTemplate = messagingTemplate;
        this.documentService = documentService;
        this.roomService = roomService;
    }

    @Override
    public void processDocumentUpdate(String roomId, DocumentUpdateMessage message, String username) {
        // 1. Save document update
        documentService.updateDocumentContent(roomId, message.getContent(), username);

        // 2. Broadcast update to room
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/document",
                new DocumentUpdateMessage(
                        message.getDocumentId(),
                        message.getContent(),
                        username,
                        System.currentTimeMillis()
                )
        );
    }

    @Override
    public void processCursorUpdate(String roomId, CursorPositionMessage message, String username) {
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/cursors",
                new CursorPositionMessage(
                        username,
                        message.getPosition(),
                        System.currentTimeMillis()
                )
        );
    }

    @Override
    public void processChatMessage(String roomId, ChatMessage message, String username) {
        // 1. Save chat message
        ChatMessage savedMessage = roomService.saveChatMessage(
                roomId,
                username,
                message.getContent()
        );

        // 2. Broadcast message to room
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/chat",
                new ChatMessage(
                        savedMessage.getId(),
                        roomId,
                        username,
                        savedMessage.getContent(),
                        LocalDateTime.now()
                )
        );
    }
}