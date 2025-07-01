//package com.PeerProbeAI.server.repository;
//
//import com.PeerProbeAI.server.model.Document;
//import com.PeerProbeAI.server.model.Room;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.Optional;
//
//@Repository
//public interface DocumentRepository extends JpaRepository<Document, Long> {
//    Document findByRoomId(Long roomId);
//
//    <T> Optional<T> findByRoom(Room room);
//}