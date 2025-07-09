package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.dto.video.CallRequest;
import com.PeerProbeAI.server.dto.video.SignalMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class VideoSignalingController {
    private static final Logger logger = LoggerFactory.getLogger(VideoSignalingController.class);

    private final SimpMessagingTemplate messagingTemplate;

    public VideoSignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/video/call")
    public void handleCallRequest(@Payload CallRequest request) {
        logger.info("Received call request from [{}] to [{}]",
                request.getCallerId(), request.getCalleeId());

        try {
            // Create topic path with callee ID
            String topic = String.format("/topic/video/call/%s", request.getCalleeId());

            messagingTemplate.convertAndSend(topic, request);
            logger.info("Call request forwarded to topic: {}", topic);
        } catch (Exception e) {
            logger.error("Error forwarding call request: {}", e.getMessage(), e);
        }
    }

    @MessageMapping("/video/signal")
    public void handleSignal(@Payload SignalMessage signal) {
        logger.info("Received signal [{}] from [{}] to [{}]",
                signal.getType(), signal.getSenderId(), signal.getReceiverId());

        try {
            // Create topic path with receiver ID
            String topic = String.format("/topic/video/signal/%s", signal.getReceiverId());

            messagingTemplate.convertAndSend(topic, signal);
            logger.info("Signal forwarded to topic: {}", topic);
        } catch (Exception e) {
            logger.error("Error forwarding signal: {}", e.getMessage(), e);
        }
    }
}