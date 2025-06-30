package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.websocket.message.DocumentUpdateMessage;
import com.PeerProbeAI.server.websocket.message.CursorPositionMessage;
import com.PeerProbeAI.server.websocket.message.ChatMessage;

public interface CollaborationService {
    void processDocumentUpdate(String roomId, DocumentUpdateMessage message, String username);
    void processCursorUpdate(String roomId, CursorPositionMessage message, String username);
    void processChatMessage(String roomId, ChatMessage message, String username);
}