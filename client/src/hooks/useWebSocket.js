import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export const useWebSocket = (docId, userId) => {
  const { 
    isConnected, 
    subscribe, 
    unsubscribe,
    sendOperation,
    sendCursorUpdate,
    joinDocument
  } = useSocket();

  const pendingOperations = useRef([]);
  const pendingCursorUpdates = useRef([]);
  const activeSubscriptions = useRef([]);

  const safeSubscribe = useCallback((destination, callback) => {
    const sub = subscribe(destination, callback);
    activeSubscriptions.current.push(sub);
    return sub;
  }, [subscribe]);

  const onOperation = useCallback((callback) => {
    return safeSubscribe(`/topic/document/${docId}`, callback);
  }, [docId, safeSubscribe]);

  const onCursorUpdate = useCallback((callback) => {
    return safeSubscribe(`/topic/document/${docId}/cursor`, callback);
  }, [docId, safeSubscribe]);

  const onParticipantsUpdate = useCallback((callback) => {
    return safeSubscribe(`/topic/document/${docId}/participants`, callback);
  }, [docId, safeSubscribe]);

  const broadcastOperation = useCallback((operation) => {
    const enrichedOp = {
      ...operation,
      userId,
      revision: operation.revision || Date.now()
    };
    
    if (isConnected) {
      sendOperation(docId, enrichedOp);
    } else {
      pendingOperations.current.push(enrichedOp);
    }
  }, [docId, isConnected, sendOperation, userId]);

  const broadcastCursorUpdate = useCallback((cursorData) => {
    if (isConnected) {
      sendCursorUpdate(docId, cursorData);
    } else {
      pendingCursorUpdates.current.push(cursorData);
    }
  }, [docId, isConnected, sendCursorUpdate]);

  const flushPending = useCallback(() => {
    pendingOperations.current.forEach(op => sendOperation(docId, op));
    pendingOperations.current = [];
    
    pendingCursorUpdates.current.forEach(cursor => sendCursorUpdate(docId, cursor));
    pendingCursorUpdates.current = [];
  }, [docId, sendOperation, sendCursorUpdate]);

  useEffect(() => {
    if (isConnected && docId) {
      joinDocument(docId);
      flushPending();
    }
  }, [isConnected, docId, joinDocument, flushPending]);

  useEffect(() => {
    return () => {
      activeSubscriptions.current.forEach(unsub => unsub());
      activeSubscriptions.current = [];
    };
  }, []);

  const getParticipants = useCallback(() => {
    return new Promise((resolve) => {
      const unsub = safeSubscribe(`/topic/document/${docId}/participants`, (data) => {
        resolve(data);
        unsub();
      });
    });
  }, [docId, safeSubscribe]);

  return {
    isConnected,
    onOperation,
    onCursorUpdate,
    onParticipantsUpdate,
    broadcastOperation,
    broadcastCursorUpdate,
    getParticipants
  };
};