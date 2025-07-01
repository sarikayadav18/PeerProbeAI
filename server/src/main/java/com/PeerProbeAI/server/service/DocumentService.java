//package com.PeerProbeAI.server.service;
//
//import com.PeerProbeAI.server.model.Document;
//import com.PeerProbeAI.server.model.DocumentVersion;
//
//import java.util.List;
//
//public interface DocumentService {
//    Document getDocumentByRoomId(Long roomId);
//    Document updateDocumentContent(Long roomId, String content, String modifiedBy);
//    Document createDocumentForRoom(Long roomId, String initialContent);
//
//    List<DocumentVersion> getDocumentHistory(Long documentId);
//}