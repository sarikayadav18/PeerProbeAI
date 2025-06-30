package com.PeerProbeAI.server.service.impl;

import com.PeerProbeAI.server.model.Document;
import com.PeerProbeAI.server.model.DocumentVersion;
import com.PeerProbeAI.server.model.Room;
import com.PeerProbeAI.server.repository.DocumentRepository;
import com.PeerProbeAI.server.repository.RoomRepository;
import com.PeerProbeAI.server.service.DocumentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final RoomRepository roomRepository;

    public DocumentServiceImpl(DocumentRepository documentRepository,
                               RoomRepository roomRepository) {
        this.documentRepository = documentRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Document getDocumentByRoomId(Long roomId) {
        return documentRepository.findByRoomId(roomId);
    }

    @Override
    @Transactional
    public Document updateDocumentContent(Long roomId, String content, String modifiedBy) {
        Document document = documentRepository.findByRoomId(roomId);
        if (document == null) {
            throw new RuntimeException("Document not found for room: " + roomId);
        }

        // Create version snapshot before updating
        DocumentVersion version = new DocumentVersion(document.getContent(), modifiedBy);
        document.addVersion(version);

        // Update current content
        document.setContent(content);
        return documentRepository.save(document);
    }

    @Override
    @Transactional
    public Document createDocumentForRoom(Long roomId, String initialContent) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        Document document = new Document(initialContent, room);
        room.setDocument(document);
        return documentRepository.save(document);
    }
}