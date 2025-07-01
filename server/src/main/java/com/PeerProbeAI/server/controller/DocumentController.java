package com.PeerProbeAI.server.controller;

import com.PeerProbeAI.server.model.CollabOperation;
import com.PeerProbeAI.server.model.DocumentState;
import com.PeerProbeAI.server.service.CollabService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final CollabService collabService;
    private final Map<String, String> documentTitles = new HashMap<>();

    @Autowired
    public DocumentController(CollabService collabService) {
        this.collabService = collabService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createDocument(@RequestBody Map<String, String> request) {
        String docId = UUID.randomUUID().toString();
        String title = request.getOrDefault("title", "Untitled Document");
        String initialContent = request.getOrDefault("content", "");

        // Initialize document state
        collabService.processOperation(docId,
                new CollabOperation(
                        CollabOperation.OperationType.INSERT,
                        0,
                        initialContent,
                        "system",
                        0
                ),
                "system"
        );

        // Store document title
        documentTitles.put(docId, title);

        Map<String, String> response = new HashMap<>();
        response.put("id", docId);
        response.put("title", title);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{docId}")
    public ResponseEntity<Map<String, Object>> getDocument(@PathVariable String docId) {
        DocumentState docState = collabService.getDocumentState(docId);
        if (docState == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", docId);
        response.put("title", documentTitles.getOrDefault(docId, "Untitled Document"));
        response.put("content", docState.getContent());
        response.put("revision", docState.getRevision());
        response.put("participants", collabService.getDocumentParticipants(docId));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{docId}/history")
    public ResponseEntity<List<CollabOperation>> getDocumentHistory(
            @PathVariable String docId,
            @RequestParam(required = false, defaultValue = "0") long sinceRevision) {

        DocumentState docState = collabService.getDocumentState(docId);
        if (docState == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(docState.getHistorySince(sinceRevision));
    }

    @PutMapping("/{docId}/title")
    public ResponseEntity<Void> updateDocumentTitle(
            @PathVariable String docId,
            @RequestBody Map<String, String> request) {

        String newTitle = request.get("title");
        if (newTitle == null || newTitle.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        documentTitles.put(docId, newTitle);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, String>> listDocuments() {
        return ResponseEntity.ok(new HashMap<>(documentTitles));
    }
}