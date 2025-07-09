import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptions = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const clientRef = useRef(null);

  const getToken = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.token || '';
  };

  const getUserId = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.id || '';
  };

  const connect = () => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current.clear();

    const socket = new SockJS('http://localhost:8080/ws', null, {
      transports: ['websocket', 'xhr-streaming'],
      withCredentials: false,
    });

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log('[WS]', msg),
      connectHeaders: {
        Authorization: `Bearer ${getToken()}`,
      },
      beforeSend: (frame) => {
        frame.headers['Authorization'] = `Bearer ${getToken()}`;
      },
      onConnect: () => {
        console.log('WS ▶ Connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      },
      onDisconnect: () => {
        console.log('WS ▶ Disconnected');
        setIsConnected(false);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`WS ▶ Reconnecting (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          setTimeout(connect, 5000);
        } else {
          console.warn('WS ▶ Max reconnect attempts reached');
        }
      },
      onStompError: (frame) => {
        console.error('WS ▶ STOMP Error:', frame.headers.message);
      },
      onWebSocketError: (err) => {
        console.error('WS ▶ WebSocket Error:', err);
      },
    });

    clientRef.current = client;
    client.activate();
  };

  useEffect(() => {
    if (getToken()) {
      connect();
    } else {
      console.warn('WS ▶ No JWT token found, skipping connection');
    }

    return () => {
      if (clientRef.current) {
        console.log('WS ▶ Cleaning up');
        subscriptions.current.forEach((sub) => sub.unsubscribe());
        subscriptions.current.clear();
        clientRef.current.deactivate();
      }
    };
  }, []);

  const subscribe = (destination, callback) => {
    if (!clientRef.current?.connected) {
      console.warn('WS ▶ Cannot subscribe, not connected yet');
      return () => {};
    }

    const headers = {
      Authorization: `Bearer ${getToken()}`,
    };

    const sub = clientRef.current.subscribe(
      destination,
      (message) => {
        try {
          const payload = message.body ? JSON.parse(message.body) : null;
          callback(payload);
        } catch (err) {
          console.error('WS ▶ Failed to parse message', err);
        }
      },
      headers
    );

    subscriptions.current.set(destination, sub);

    return () => {
      sub.unsubscribe();
      subscriptions.current.delete(destination);
    };
  };

  const send = (destination, bodyObj) => {
    if (!clientRef.current?.connected) {
      console.warn('WS ▶ Cannot send, not connected yet');
      return false;
    }
    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(bodyObj),
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return true;
    } catch (err) {
      console.error('WS ▶ Failed to publish message', err);
      return false;
    }
  };

  // ✅ Updated Video Signaling methods
  const initiateCall = (calleeId) => {
    return send('/app/video/call', {
      callerId: getUserId().toString(),  // Ensure string format
      calleeId: calleeId.toString()  // Ensure string format
    });
  };

  const sendSignal = (receiverId, signal) => {
    return send('/app/video/signal', {
      senderId: getUserId().toString(),  // Ensure string format
      receiverId: receiverId.toString(),  // Ensure string format
      ...signal
    });
  };

  const subscribeToIncomingCalls = (callback) => {
    const userId = getUserId().toString();
    return subscribe(`/topic/video/call/${userId}`, callback);
  };

  const subscribeToSignals = (callback) => {
    const userId = getUserId().toString();
    return subscribe(`/topic/video/signal/${userId}`, callback);
  };

  const value = {
    isConnected,
    subscribe,
    unsubscribe: (destination) => {
      const sub = subscriptions.current.get(destination);
      if (sub) {
        sub.unsubscribe();
        subscriptions.current.delete(destination);
      }
    },
    sendOperation: (docId, op) => send(`/app/document/${docId}/edit`, op),
    sendCursorUpdate: (docId, cursor) => send(`/app/document/${docId}/cursor`, cursor),
    joinDocument: (docId, userId) => send(`/app/document/${docId}/join`, { userId }),
    sendMessageTo: (destination, payload = {}) => send(destination, payload),

    // ✅ Expose updated video signaling methods
    initiateCall,
    sendSignal,
    subscribeToIncomingCalls,
    subscribeToSignals,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
