//package com.PeerProbeAI.server.repository;
//
//import com.PeerProbeAI.server.model.UserPresence;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Modifying;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {
//
//    List<UserPresence> findByRoomIdAndIsOnlineTrue(Long roomId);
//
//    List<UserPresence> findByUserId(Long userId);
//
//    @Transactional
//    @Modifying
//    @Query("UPDATE UserPresence up SET up.isOnline = false, up.lastActive = ?2 WHERE up.user.id = ?1")
//    void markUserAsOffline(Long userId, LocalDateTime timestamp);
//
//    @Transactional
//    @Modifying
//    @Query("UPDATE UserPresence up SET up.lastActive = ?2 WHERE up.user.id = ?1")
//    void updateLastActive(Long userId, LocalDateTime timestamp);
//}