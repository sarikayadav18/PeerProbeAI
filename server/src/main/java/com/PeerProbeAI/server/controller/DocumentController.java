package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.dto.response.DocumentResponse;
import com.PeerProbeAI.server.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<DocumentResponse> getDocumentByRoom(@PathVariable Long roomId) {
        Document document = documentService.getDocumentByRoomId(roomId);
        return ResponseEntity.ok(new DocumentResponse(document));
    }

    @GetMapping("/{documentId}/history")
    public ResponseEntity<List<DocumentVersionResponse>> getDocumentHistory(
            @PathVariable Long documentId) {
        List<DocumentVersion> versions = documentService.getDocumentHistory(documentId);
        List<DocumentVersionResponse> response = versions.stream()
                .map(DocumentVersionResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}