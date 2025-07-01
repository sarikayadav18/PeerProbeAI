//package com.PeerProbeAI.server.model;
//
//import javax.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "user_presence")
//public class UserPresence {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "room_id", nullable = false)
//    private Room room;
//
//    @Column(nullable = false)
//    private LocalDateTime lastActive;
//
//    @Column(nullable = false)
//    private Boolean isOnline;
//
//    // Constructors
//    public UserPresence() {
//        this.lastActive = LocalDateTime.now();
//        this.isOnline = true;
//    }
//
//    public UserPresence(User user, Room room) {
//        this();
//        this.user = user;
//        this.room = room;
//    }
//
//    // Getters and Setters
//    public Long getId() {
//        return id;
//    }
//
//    public User getUser() {
//        return user;
//    }
//
//    public void setUser(User user) {
//        this.user = user;
//    }
//
//    public Room getRoom() {
//        return room;
//    }
//
//    public void setRoom(Room room) {
//        this.room = room;
//    }
//
//    public LocalDateTime getLastActive() {
//        return lastActive;
//    }
//
//    public void setLastActive(LocalDateTime lastActive) {
//        this.lastActive = lastActive;
//    }
//
//    public Boolean getIsOnline() {
//        return isOnline;
//    }
//
//    public void setIsOnline(Boolean online) {
//        isOnline = online;
//    }
//
//    // Helper Methods
//    public void updatePresence() {
//        this.lastActive = LocalDateTime.now();
//        this.isOnline = true;
//    }
//
//    public void markAsOffline() {
//        this.isOnline = false;
//        this.lastActive = LocalDateTime.now();
//    }
//}