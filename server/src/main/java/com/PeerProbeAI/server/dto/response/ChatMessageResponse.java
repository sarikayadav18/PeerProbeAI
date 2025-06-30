package com.PeerProbeAI.server.dto.response;

import com.PeerProbeAI.server.model.ChatMessage;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ChatMessageResponse {
    private final Long id;
    private final Long senderId;
    private final String senderName;
    private final String content;
    private final LocalDateTime timestamp;

    public ChatMessageResponse(ChatMessage message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderName = message.getSender().getUsername();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
    }
}