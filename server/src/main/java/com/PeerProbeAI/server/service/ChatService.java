//package com.PeerProbeAI.server.service;
//
//import com.PeerProbeAI.server.model.Document;
//import com.PeerProbeAI.server.model.DocumentVersion;
//import com.PeerProbeAI.server.model.Room;
//import com.PeerProbeAI.server.repository.DocumentRepository;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//
//@Service
//public class ChatService {
//
//    private final DocumentRepository documentRepository;
//
//    public ChatService(DocumentRepository documentRepository) {
//        this.documentRepository = documentRepository;
//    }
//
//    /**
//     * Updates document content and creates a new version
//     */
//    @Transactional
//    public Document updateDocumentContent(Long documentId, String newContent, String editorName) {
//        Document document = documentRepository.findById(documentId)
//                .orElseThrow(() -> new RuntimeException("Document not found"));
//
//        // Create version snapshot before updating
//        DocumentVersion version = new DocumentVersion(
//                document.getContent(),
//                LocalDateTime.now(),
//                editorName
//        );
//        document.addVersion(version);
//
//        // Update current content
//        document.setContent(newContent);
//        return documentRepository.save(document);
//    }
//
//    /**
//     * Gets the current document content for a room
//     */
//    public String getDocumentContentByRoom(Room room) {
//        return documentRepository.findByRoom(room)
//                .map(Document::getContent)
//                .orElse("");
//    }
//
//    /**
//     * Creates a new document linked to a room
//     */
//    public Document createDocumentForRoom(Room room, String initialContent) {
//        Document document = new Document(initialContent, room);
//        return documentRepository.save(document);
//    }
//
//    /**
//     * Rolls back to a specific document version
//     */
//    @Transactional
//    public Document rollbackToVersion(Long documentId, Long versionId) {
//        Document document = documentRepository.findById(documentId)
//                .orElseThrow(() -> new RuntimeException("Document not found"));
//
//        Optional<DocumentVersion> targetVersion = document.getVersions().stream()
//                .filter(v -> v.getId().equals(versionId))
//                .findFirst();
//
//        if (targetVersion.isPresent()) {
//            // Create a new version before rollback
//            DocumentVersion rollbackVersion = new DocumentVersion(
//                    document.getContent(),
//                    LocalDateTime.now(),
//                    "System-Rollback"
//            );
//            document.addVersion(rollbackVersion);
//
//            // Restore content
//            document.setContent(targetVersion.get().getContent());
//            return documentRepository.save(document);
//        }
//
//        throw new RuntimeException("Version not found");
//    }
//}