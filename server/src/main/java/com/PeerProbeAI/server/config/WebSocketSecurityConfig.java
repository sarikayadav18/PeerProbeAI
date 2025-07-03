package com.PeerProbeAI.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketSecurityConfig.class);

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    public WebSocketSecurityConfig(WebSocketAuthInterceptor webSocketAuthInterceptor) {
        this.webSocketAuthInterceptor = webSocketAuthInterceptor;
        logger.info("WebSocketSecurityConfig initialized");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        logger.debug("Configuring client inbound channel with authentication interceptor");
        registration.interceptors(webSocketAuthInterceptor);
    }
}