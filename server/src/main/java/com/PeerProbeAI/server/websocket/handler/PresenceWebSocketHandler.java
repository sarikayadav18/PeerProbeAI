//package com.PeerProbeAI.server.websocket.handler;
//
//import com.PeerProbeAI.server.service.PresenceService;
//import org.springframework.web.socket.WebSocketHandler;
//import org.springframework.web.socket.WebSocketSession;
//import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
//
//public class PresenceWebSocketHandler extends WebSocketHandlerDecorator {
//
//    private final PresenceService presenceService;
//
//    public PresenceWebSocketHandler(WebSocketHandler delegate, PresenceService presenceService) {
//        super(delegate);
//        this.presenceService = presenceService;
//    }
//
//    @Override
//    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//        String username = session.getPrincipal().getName();
//        String roomId = extractRoomId(session);
//
//        presenceService.userJoined(roomId, username);
//        super.afterConnectionEstablished(session);
//    }
//
//    @Override
//    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
//        String username = session.getPrincipal().getName();
//        String roomId = extractRoomId(session);
//
//        presenceService.userLeft(roomId, username);
//        super.afterConnectionClosed(session, status);
//    }
//
//    private String extractRoomId(WebSocketSession session) {
//        // Extract room ID from session attributes or URI
//        return session.getAttributes().get("roomId").toString();
//    }
//}