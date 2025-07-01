//package com.PeerProbeAI.server.service.impl;
//
//import com.PeerProbeAI.server.service.PresenceService;
//import org.springframework.stereotype.Service;
//import java.util.Map;
//import java.util.Set;
//import java.util.concurrent.ConcurrentHashMap;
//import java.util.concurrent.CopyOnWriteArraySet;
//
//@Service
//public class PresenceServiceImpl implements PresenceService {
//
//    private final Map<String, Set<String>> activeUsersByRoom = new ConcurrentHashMap<>();
//
//    @Override
//    public void userJoined(String roomId, String username) {
//        activeUsersByRoom.computeIfAbsent(roomId, k -> new CopyOnWriteArraySet<>()).add(username);
//        broadcastPresence(roomId);
//    }
//
//    @Override
//    public void userLeft(String roomId, String username) {
//        Set<String> users = activeUsersByRoom.get(roomId);
//        if (users != null) {
//            users.remove(username);
//            if (users.isEmpty()) {
//                activeUsersByRoom.remove(roomId);
//            } else {
//                broadcastPresence(roomId);
//            }
//        }
//    }
//
//    @Override
//    public Set<String> getActiveUsers(String roomId) {
//        return activeUsersByRoom.getOrDefault(roomId, Set.of());
//    }
//
//    private void broadcastPresence(String roomId) {
//        // Implementation would use SimpMessagingTemplate to send presence updates
//    }
//}