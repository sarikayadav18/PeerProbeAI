package com.PeerProbeAI.server.service;

import com.PeerProbeAI.server.model.CollabOperation;

public class OperationalTransformer {
    public static CollabOperation transform(CollabOperation op1, CollabOperation op2) {
        if (op1.getType() == CollabOperation.OperationType.INSERT) {
            return transformInsert(op1, op2);
        } else if (op1.getType() == CollabOperation.OperationType.DELETE) {
            return transformDelete(op1, op2);
        }
        return op1;
    }

    private static CollabOperation transformInsert(CollabOperation insert, CollabOperation other) {
        int pos = insert.getPosition();

        if (other.getType() == CollabOperation.OperationType.INSERT) {
            if (other.getPosition() <= pos) {
                insert.setPosition(pos + other.getText().length());
            }
        } else if (other.getType() == CollabOperation.OperationType.DELETE) {
            if (other.getPosition() < pos) {
                insert.setPosition(pos - other.getLength());
            } else if (other.getPosition() == pos) {
                // Deletion at same position - move insert after delete
                insert.setPosition(pos);
            }
        }

        return insert;
    }

    private static CollabOperation transformDelete(CollabOperation delete, CollabOperation other) {
        int pos = delete.getPosition();
        int len = delete.getLength();

        if (other.getType() == CollabOperation.OperationType.INSERT) {
            if (other.getPosition() <= pos) {
                delete.setPosition(pos + other.getText().length());
            }
        } else if (other.getType() == CollabOperation.OperationType.DELETE) {
            if (other.getPosition() < pos) {
                delete.setPosition(pos - other.getLength());
            } else if (other.getPosition() == pos) {
                delete.setLength(0); // Concurrent deletion - no-op
            }
        }

        return delete;
    }
}