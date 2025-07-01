//package com.PeerProbeAI.server.model;
//
//import jakarta.persistence.*;
//
//import javax.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "document_versions")
//public class DocumentVersion {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(columnDefinition = "TEXT")
//    private String content;
//
//    private LocalDateTime createdAt;
//
//    private String modifiedBy;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "document_id")
//    private Document document;
//
//    // Constructors
//    public DocumentVersion() {
//        // Default constructor for JPA
//    }
//
//    /**
//     * Full constructor for manual creation
//     */
//    public DocumentVersion(String content, String modifiedBy, Document document) {
//        this.content = content;
//        this.modifiedBy = modifiedBy;
//        this.createdAt = LocalDateTime.now();
//        this.document = document;
//    }
//
//    // Getters and Setters
//    public Long getId() {
//        return id;
//    }
//
//    public String getContent() {
//        return content;
//    }
//
//    public void setContent(String content) {
//        this.content = content;
//    }
//
//    public LocalDateTime getCreatedAt() {
//        return createdAt;
//    }
//
//    public void setCreatedAt(LocalDateTime createdAt) {
//        this.createdAt = createdAt;
//    }
//
//    public String getModifiedBy() {
//        return modifiedBy;
//    }
//
//    public void setModifiedBy(String modifiedBy) {
//        this.modifiedBy = modifiedBy;
//    }
//
//    public Document getDocument() {
//        return document;
//    }
//
//    public void setDocument(Document document) {
//        this.document = document;
//    }
//
//    // Utility method (optional)
//    public String getVersionInfo() {
//        return String.format("Version %d (%s) by %s",
//                id,
//                createdAt.toString(),
//                modifiedBy);
//    }
//}