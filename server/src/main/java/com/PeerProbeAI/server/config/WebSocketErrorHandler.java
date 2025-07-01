//package com.PeerProbeAI.server.config;
//
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.WebSocketHandler;
//import org.springframework.web.socket.WebSocketSession;
//import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
//import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;
//
//import java.util.logging.ErrorManager;
//
//public class WebSocketErrorHandler implements WebSocketHandlerDecoratorFactory {
//
//    @Override
//    public WebSocketHandler decorate(WebSocketHandler handler) {
//        return new WebSocketHandlerDecorator(handler) {
//            @Override
//            public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
//                // Log WebSocket errors
//                ErrorManager logger = null;
//                logger.error("WebSocket error occurred: " + exception.getMessage(), exception);
//
//                // Send error message to client
//                TextMessage errorMessage = new TextMessage("ERROR: " + exception.getMessage());
//                session.sendMessage(errorMessage);
//
//                // Close session if it's a critical error
//                if (exception instanceof InvalidTokenException) {
//                    session.close(CloseStatus.NOT_ACCEPTABLE);
//                }
//            }
//        };
//    }
//}