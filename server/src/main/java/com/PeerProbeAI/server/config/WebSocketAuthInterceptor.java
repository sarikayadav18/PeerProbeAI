package com.PeerProbeAI.server.config;

import com.PeerProbeAI.server.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final List<SimpleGrantedAuthority> DEFAULT_AUTHORITIES =
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

    private final JwtUtils jwtUtils;

    public WebSocketAuthInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
        logger.info("WebSocketAuthInterceptor initialized");
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            logger.error("Null accessor in WebSocket message");
            return message;
        }

        StompCommand command = accessor.getCommand();
        if (command == null) {
            logger.error("Null command in WebSocket message");
            return message;
        }

        // Only handle CONNECT and SUBSCRIBE commands
        if (StompCommand.CONNECT.equals(command) || StompCommand.SUBSCRIBE.equals(command)) {
            return handleAuthentication(accessor, message);
        }

        return message;
    }

    private Message<?> handleAuthentication(StompHeaderAccessor accessor, Message<?> message) {
        try {
            String token = extractToken(accessor);
            if (token == null) {
                logger.warn("No token provided in {} command", accessor.getCommand());
                return rejectConnection(message);
            }

            if (!jwtUtils.validateJwtToken(token)) {
                logger.warn("Invalid JWT token in {} command", accessor.getCommand());
                return rejectConnection(message);
            }

            JwtUtils.UserDetails userDetails = jwtUtils.getUserDetailsFromToken(token);
            if (userDetails == null) {
                logger.error("Could not extract user details from valid token");
                return rejectConnection(message);
            }

            UsernamePasswordAuthenticationToken auth = createAuthentication(userDetails);
            accessor.setUser(auth);

            logger.info("Authenticated {} command for user {} (ID: {})",
                    accessor.getCommand(),
                    userDetails.getUsername(),
                    userDetails.getUserId());

            return message;
        } catch (Exception e) {
            logger.error("Authentication error during {} command: {}",
                    accessor.getCommand(), e.getMessage());
            logger.debug("Authentication error stack trace:", e);
            return rejectConnection(message);
        }
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader(AUTH_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return authHeader.substring(BEARER_PREFIX.length());
    }

    private UsernamePasswordAuthenticationToken createAuthentication(JwtUtils.UserDetails userDetails) {
        return new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                DEFAULT_AUTHORITIES
        );
    }

    private Message<?> rejectConnection(Message<?> message) {
        // In a production environment, you might want to:
        // 1. Send an error message to the client
        // 2. Close the connection gracefully
        // 3. Implement rate limiting

        logger.debug("Rejecting WebSocket connection");
        return null; // Returning null rejects the message
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return;

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String user = accessor.getUser() != null ? accessor.getUser().getName() : "anonymous";
            logger.debug("User {} subscribed to {}", user, accessor.getDestination());
        }
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        if (ex != null) {
            logger.error("Error during WebSocket message sending: {}", ex.getMessage());
        }
    }
}