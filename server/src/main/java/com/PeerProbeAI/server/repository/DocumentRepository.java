package com.PeerProbeAI.server.repository;

import com.PeerProbeAI.server.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Document findByRoomId(Long roomId);
}