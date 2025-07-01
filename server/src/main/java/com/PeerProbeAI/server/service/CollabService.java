package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.model.CollabOperation;
import com.PeerProbeAI.server.model.DocumentState;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CollabService {
    private final Map<String, DocumentState> documentStates = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> documentParticipants = new ConcurrentHashMap<>();

    // Add this method to get document state by ID
    public DocumentState getDocumentState(String docId) {
        return documentStates.get(docId);
    }

    public CollabOperation processOperation(String docId, CollabOperation operation, String userId) {
        // Get or create document state
        DocumentState docState = documentStates.computeIfAbsent(docId, k -> new DocumentState());

        // Set the user ID if not set
        if (operation.getUserId() == null) {
            operation.setUserId(userId);
        }

        // Apply operational transformation
        CollabOperation transformedOp = transformOperation(docState, operation);

        // Apply the operation to the document
        applyOperation(docState, transformedOp);

        // Update revision number
        transformedOp.setRevision(docState.getRevision());
        docState.incrementRevision();

        // Add to history
        docState.addToHistory(transformedOp);

        return transformedOp;
    }

    private CollabOperation transformOperation(DocumentState docState, CollabOperation operation) {
        List<CollabOperation> history = docState.getHistorySince(operation.getRevision());

        // Create a copy of the operation to transform
        CollabOperation transformedOp = copyOperation(operation);

        // Apply OT to the operation against all concurrent operations
        for (CollabOperation historicOp : history) {
            if (historicOp.getUserId().equals(operation.getUserId())) {
                continue; // Skip operations from the same user
            }

            transformedOp = transformAgainst(transformedOp, historicOp);
        }

        return transformedOp;
    }

    private CollabOperation transformAgainst(CollabOperation op1, CollabOperation op2) {
        // Simple OT implementation for text operations
        if (op1.getType() == CollabOperation.OperationType.INSERT &&
                op2.getType() == CollabOperation.OperationType.INSERT) {
            return transformInsertInsert(op1, op2);
        } else if (op1.getType() == CollabOperation.OperationType.INSERT &&
                op2.getType() == CollabOperation.OperationType.DELETE) {
            return transformInsertDelete(op1, op2);
        }
        // Add more transformation cases as needed
        return op1;
    }

    private CollabOperation transformInsertInsert(CollabOperation op1, CollabOperation op2) {
        // If op2 inserts before op1, shift op1's position
        if (op2.getPosition() <= op1.getPosition()) {
            op1.setPosition(op1.getPosition() + op2.getText().length());
        }
        return op1;
    }

    private CollabOperation transformInsertDelete(CollabOperation op1, CollabOperation op2) {
        // If deletion is before insertion, no conflict
        if (op2.getPosition() + op2.getLength() <= op1.getPosition()) {
            op1.setPosition(op1.getPosition() - op2.getLength());
        }
        // If deletion overlaps with insertion, adjust position
        else if (op2.getPosition() < op1.getPosition()) {
            op1.setPosition(op2.getPosition());
        }
        return op1;
    }

    private void applyOperation(DocumentState docState, CollabOperation operation) {
        // Apply the operation to the document content
        if (operation.getType() == CollabOperation.OperationType.INSERT) {
            docState.insertText(operation.getPosition(), operation.getText());
        } else if (operation.getType() == CollabOperation.OperationType.DELETE) {
            docState.deleteText(operation.getPosition(), operation.getLength());
        }
    }

    public String[] getDocumentParticipants(String docId) {
        Set<String> participants = documentParticipants.getOrDefault(docId, new HashSet<>());
        return participants.toArray(new String[0]);
    }

    public void addParticipant(String docId, String userId) {
        documentParticipants.computeIfAbsent(docId, k -> new HashSet<>()).add(userId);
    }

    public void removeParticipant(String docId, String userId) {
        Set<String> participants = documentParticipants.get(docId);
        if (participants != null) {
            participants.remove(userId);
        }
    }

    private CollabOperation copyOperation(CollabOperation original) {
        CollabOperation copy = new CollabOperation();
        copy.setType(original.getType());
        copy.setPosition(original.getPosition());
        copy.setText(original.getText());
        copy.setLength(original.getLength());
        copy.setUserId(original.getUserId());
        copy.setRevision(original.getRevision());
        return copy;
    }
}