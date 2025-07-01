//package com.PeerProbeAI.server.dto.response;
//
//import java.util.Set;
//import java.util.stream.Collectors;
//
//public class UserPresenceResponse {
//    private final String roomId;
//    private final Set<UserInfo> activeUsers;
//
//    public UserPresenceResponse(String roomId, Set<String> usernames) {
//        this.roomId = roomId;
//        this.activeUsers = usernames.stream()
//                .map(UserInfo::new)
//                .collect(Collectors.toSet());
//    }
//
//    // Getters
//    public String getRoomId() {
//        return roomId;
//    }
//
//    public Set<UserInfo> getActiveUsers() {
//        return activeUsers;
//    }
//
//    public static class UserInfo {
//        private final String username;
//        private final long lastActiveTimestamp;
//
//        public UserInfo(String username) {
//            this.username = username;
//            this.lastActiveTimestamp = System.currentTimeMillis();
//        }
//
//        // Getters
//        public String getUsername() {
//            return username;
//        }
//
//        public long getLastActiveTimestamp() {
//            return lastActiveTimestamp;
//        }
//    }
//}