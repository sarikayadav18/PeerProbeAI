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

  // pull token from localStorage whenever we connect
  const getToken = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return user?.token || '';
  };

  const connect = () => {
    // clean up old subscriptions
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current.clear();

    const socket = new SockJS('http://localhost:8080/collab-ws', null, {
      transports: ['websocket', 'xhr-streaming'],
      withCredentials: false,
    });

    const client = new Client({
      // use SockJS under the hood
      webSocketFactory: () => socket,

      // heartbeat & debug
      reconnectDelay: 0,           // we'll handle reconnection manually
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.log('[WS]', msg),

      // initial connect headers
      connectHeaders: {
        Authorization: `Bearer ${getToken()}`,
      },

      // inject auth header on every outgoing STOMP frame
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
          console.log(`Reconnecting… (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          setTimeout(connect, 5000);
        } else {
          console.warn('Max reconnect attempts reached');
        }
      },

      onStompError: (frame) => {
        console.error('STOMP Error ▶', frame.headers.message);
        if (frame.headers.message.toLowerCase().includes('unauthorized')) {
          console.error('Authentication failed – check your token');
        }
      },

      onWebSocketError: (err) => {
        console.error('WebSocket Error ▶', err);
      },
    });

    clientRef.current = client;
    client.activate();
  };

  useEffect(() => {
    // only connect if token exists
    if (getToken()) {
      connect();
    } else {
      console.warn('No JWT found – skipping WS connect');
    }

    return () => {
      // cleanup on unmount
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
      console.warn('WS ▶ Cannot subscribe; not connected yet');
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
          console.error('WS ▶ parse error', err);
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

  const send = (dest, bodyObj) => {
    if (!clientRef.current?.connected) {
      console.warn('WS ▶ Cannot send; not connected');
      return false;
    }
    try {
      clientRef.current.publish({
        destination: dest,
        body: JSON.stringify(bodyObj),
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return true;
    } catch (err) {
      console.error('WS ▶ publish failed', err);
      return false;
    }
  };

  // Inside SocketProvider, just before `return`:
  const sendMessageTo = (destination, payload = {}) => {
    return send(destination, payload);
  };

  const value = {
    isConnected,
    subscribe,
    unsubscribe: (dest) => {
      const sub = subscriptions.current.get(dest);
      if (sub) {
        sub.unsubscribe();
        subscriptions.current.delete(dest);
      }
    },
    sendOperation: (docId, op) => send(`/app/document/${docId}/edit`, op),
    sendCursorUpdate: (docId, cursor) => send(`/app/document/${docId}/cursor`, cursor),
    joinDocument: (docId, userId) => send(`/app/document/${docId}/join`, { userId }),
    sendMessageTo,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
