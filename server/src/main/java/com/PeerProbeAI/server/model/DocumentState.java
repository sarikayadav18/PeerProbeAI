package com.PeerProbeAI.server.model;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

public class DocumentState {
    private String content;
    private long revision;
    private final List<CollabOperation> operationHistory;
    private final ReentrantLock lock;

    public DocumentState() {
        this.content = "";
        this.revision = 0;
        this.operationHistory = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public DocumentState(String initialContent) {
        this.content = initialContent != null ? initialContent : "";
        this.revision = 0;
        this.operationHistory = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public void insertText(int position, String text) {
        lock.lock();
        try {
            if (position < 0) position = 0;
            if (position > content.length()) position = content.length();

            String before = content.substring(0, position);
            String after = content.substring(position);
            content = before + text + after;
        } finally {
            lock.unlock();
        }
    }

    public void deleteText(int position, int length) {
        lock.lock();
        try {
            if (position < 0) position = 0;
            if (length <= 0) return;

            int end = position + length;
            if (end > content.length()) {
                end = content.length();
                length = end - position;
            }

            if (position >= content.length()) return;

            String before = content.substring(0, position);
            String after = content.substring(end);
            content = before + after;
        } finally {
            lock.unlock();
        }
    }

    public void addToHistory(CollabOperation operation) {
        lock.lock();
        try {
            operationHistory.add(operation);
        } finally {
            lock.unlock();
        }
    }

    public List<CollabOperation> getHistorySince(long sinceRevision) {
        lock.lock();
        try {
            List<CollabOperation> recentHistory = new ArrayList<>();
            for (int i = operationHistory.size() - 1; i >= 0; i--) {
                CollabOperation op = operationHistory.get(i);
                if (op.getRevision() > sinceRevision) {
                    recentHistory.add(0, op); // Add to beginning to maintain order
                } else {
                    break;
                }
            }
            return recentHistory;
        } finally {
            lock.unlock();
        }
    }

    public void incrementRevision() {
        lock.lock();
        try {
            revision++;
        } finally {
            lock.unlock();
        }
    }

    // Getters
    public String getContent() {
        lock.lock();
        try {
            return content;
        } finally {
            lock.unlock();
        }
    }

    public long getRevision() {
        lock.lock();
        try {
            return revision;
        } finally {
            lock.unlock();
        }
    }

    public List<CollabOperation> getOperationHistory() {
        lock.lock();
        try {
            return new ArrayList<>(operationHistory);
        } finally {
            lock.unlock();
        }
    }
}