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
        logger.info("VideoSignalingController initialized successfully.");
    }

    /**
     * Handles incoming call requests and forwards them to the callee via "/user/queue/incoming-call".
     *
     * Client should send to: "/app/video/call"
     * Callee should subscribe to: "/user/queue/incoming-call"
     */
    @MessageMapping("/video/call")
    public void handleCallRequest(@Payload CallRequest request) {
        logger.info("Received call request from [{}] to [{}]", request.getCallerId(), request.getCalleeId());
        logger.debug("CallRequest payload: {}", request);

        try {
            String calleeId = request.getCalleeId().toString();
            logger.debug("Forwarding call request to user [{}]", calleeId);

            messagingTemplate.convertAndSendToUser(
                    calleeId,
                    "/queue/incoming-call",
                    request
            );

            logger.info("Call request forwarded successfully to [{}]", calleeId);
        } catch (Exception e) {
            logger.error("Error forwarding call request from [{}] to [{}]: {}",
                    request.getCallerId(),
                    request.getCalleeId(),
                    e.getMessage(), e);
        }
    }

    /**
     * Handles WebRTC signaling messages (offer, answer, ICE candidates).
     * Forwards the signal to the intended receiver via "/user/queue/signal".
     *
     * Client should send to: "/app/video/signal"
     * Receiver should subscribe to: "/user/queue/signal"
     */
    @MessageMapping("/video/signal")
    public void handleSignal(@Payload SignalMessage signal) {
        logger.info("Received signal [{}] from [{}] to [{}]",
                signal.getType(),
                signal.getSenderId(),
                signal.getReceiverId());
        logger.debug("SignalMessage payload: {}", signal);

        try {
            String receiverId = signal.getReceiverId().toString();
            logger.debug("Forwarding signal [{}] to user [{}]", signal.getType(), receiverId);

            messagingTemplate.convertAndSendToUser(
                    receiverId,
                    "/queue/signal",
                    signal
            );

            logger.info("Signal [{}] forwarded successfully to [{}]", signal.getType(), receiverId);
        } catch (Exception e) {
            logger.error("Error forwarding signal [{}] from [{}] to [{}]: {}",
                    signal.getType(),
                    signal.getSenderId(),
                    signal.getReceiverId(),
                    e.getMessage(), e);
        }
    }
}
