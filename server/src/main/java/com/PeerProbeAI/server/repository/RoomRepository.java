//package com.PeerProbeAI.server.repository;
//
//import com.PeerProbeAI.server.model.Room;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.Optional;
//
//@Repository
//public interface RoomRepository extends JpaRepository<Room, Long> {
//    Optional<Room> findByCode(String code);
//    boolean existsByCode(String code);
//}