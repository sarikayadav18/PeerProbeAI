//package com.PeerProbeAI.server.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.messaging.simp.config.MessageBrokerRegistry;
//import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
//import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
//import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
//import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
//
//@Configuration
//@EnableWebSocketMessageBroker
//public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry config) {
//        // Configure message broker
//        config.enableSimpleBroker("/topic", "/queue");
//        config.setApplicationDestinationPrefixes("/app");
//
//        // Set user destination prefix for private messages
//        config.setUserDestinationPrefix("/user");
//    }
//
//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        // Register WebSocket endpoints
//        registry.addEndpoint("/collab-ws")
//                .setAllowedOriginPatterns("*")
//                .withSockJS()
//                .setStreamBytesLimit(512 * 1024) // 512KB
//                .setHttpMessageCacheSize(1000)
//                .setDisconnectDelay(30 * 1000); // 30 seconds
//
//        registry.addEndpoint("/collab-ws-native")
//                .setAllowedOriginPatterns("*");
//    }
//
//    @Override
//    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
//        // Configure WebSocket transport options
//        registration.setMessageSizeLimit(512 * 1024); // 512KB
//        registration.setSendTimeLimit(20 * 1000); // 20 seconds
//        registration.setSendBufferSizeLimit(512 * 1024); // 512KB
//    }
//}