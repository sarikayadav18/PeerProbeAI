package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.model.Room;
import com.PeerProbeAI.server.model.ChatMessage;
import java.util.List;

public interface RoomService {
    Room createRoom(String name, Long ownerId);
    Room getRoomById(Long roomId);
    Room getRoomByCode(String code);
    void addParticipant(Long roomId, Long userId);
    ChatMessage saveChatMessage(Long roomId, Long senderId, String content);
    List<ChatMessage> getChatHistory(Long roomId);
}