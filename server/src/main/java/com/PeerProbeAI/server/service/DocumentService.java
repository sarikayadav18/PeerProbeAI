package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.model.Document;

public interface DocumentService {
    Document getDocumentByRoomId(Long roomId);
    Document updateDocumentContent(Long roomId, String content, String modifiedBy);
    Document createDocumentForRoom(Long roomId, String initialContent);
}