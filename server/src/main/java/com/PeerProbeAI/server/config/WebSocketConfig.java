package com.PeerProbeAI.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        logger.info("Configuring message broker for collaboration and video signaling");

        // Enable brokers for collaboration and video signaling
        config.enableSimpleBroker(
                "/topic", "/queue",
                "/video/topic", "/video/queue"
        );

        // ✅ Use a single consistent application prefix
        config.setApplicationDestinationPrefixes("/app");

        // User destination prefix for convertAndSendToUser
        config.setUserDestinationPrefix("/user");

        logger.debug("Enabled simple broker on: /topic, /queue, /video/topic, /video/queue");
        logger.debug("Set application destination prefix: /app");
        logger.debug("Set user destination prefix: /user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        logger.info("Registering WebSocket endpoints for collaboration and video signaling");

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://your-production-domain.com"
                )
                .withSockJS()
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1.5.2/dist/sockjs.min.js");

        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "https://your-production-domain.com"
                );

        logger.debug("Registered endpoints: /ws (SockJS), /ws-native (native WebSocket)");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(1024 * 1024);      // 1MB
        registration.setSendTimeLimit(30 * 1000);           // 30s
        registration.setSendBufferSizeLimit(1024 * 1024);   // 1MB
        registration.setTimeToFirstMessage(30000);          // 30s

        logger.info("Configured WebSocket transport with increased limits for signaling");
    }
}
