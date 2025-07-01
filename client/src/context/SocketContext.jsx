import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptions = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const clientRef = useRef(null);

  const connect = () => {
    // Clear any existing subscriptions on reconnect
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current.clear();

    // Create SockJS connection
    const socket = new SockJS('http://localhost:8080/collab-ws', null, {
      transports: ['websocket', 'xhr-streaming'],
      withCredentials: false
    });

    // Configure STOMP client
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('[WS]', str),
      connectHeaders: {

        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      onConnect: () => {
        console.log('Successfully connected to WebSocket');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          setTimeout(connect, 5000);
        } else {
          console.log('Max reconnection attempts reached');
        }
      },
      onStompError: (frame) => {
        console.error('STOMP protocol error:', frame.headers.message);
        // Handle authentication errors specifically
        if (frame.headers.message.includes('unauthorized')) {
          console.error('Authentication failed - check your token');
        }
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    clientRef.current = client;
    client.activate();
    setStompClient(client);
  };

  useEffect(() => {
    // Only attempt to connect if we have a token
    const userStr = localStorage.getItem('user');
    console.log(userStr);

    const user = userStr ? JSON.parse(userStr) : null;
    const token = user?.token;

    console.log(token);

    if (token) {
      connect();
    } else {
      console.warn('No JWT token found - WebSocket connection not attempted');
    }

    return () => {
      // Cleanup on unmount
      if (clientRef.current) {
        console.log('Cleaning up WebSocket connection');
        subscriptions.current.forEach((sub) => sub.unsubscribe());
        subscriptions.current.clear();
        clientRef.current.deactivate();
      }
    };
  }, []);

  const subscribe = (destination, callback) => {
    if (!stompClient || !isConnected) {
      console.warn('Cannot subscribe - not connected to WebSocket');
      return () => {};
    }

    const subscription = stompClient.subscribe(destination, (message) => {
      try {
        const parsed = message.body ? JSON.parse(message.body) : null;
        callback(parsed);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    subscriptions.current.set(destination, subscription);
    return () => unsubscribe(destination);
  };

  const unsubscribe = (destination) => {
    const subscription = subscriptions.current.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.current.delete(destination);
    }
  };

  const sendOperation = (docId, operation) => {
    if (!stompClient || !isConnected) {
      console.warn('Cannot send operation - not connected');
      return false;
    }
    
    try {
      stompClient.publish({
        destination: `/app/document/${docId}/edit`,
        body: JSON.stringify(operation),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return true;
    } catch (error) {
      console.error('Operation send failed:', error);
      return false;
    }
  };

  const sendCursorUpdate = (docId, cursorData) => {
    if (!stompClient || !isConnected) {
      console.warn('Cannot send cursor update - not connected');
      return false;
    }
    
    try {
      stompClient.publish({
        destination: `/app/document/${docId}/cursor`,
        body: JSON.stringify(cursorData),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return true;
    } catch (error) {
      console.error('Cursor update failed:', error);
      return false;
    }
  };

  const joinDocument = (docId, userId) => {
    if (!stompClient || !isConnected) {
      console.warn('Cannot join document - not connected');
      return false;
    }
    
    try {
      stompClient.publish({
        destination: `/app/document/${docId}/join`,
        body: JSON.stringify({ userId }),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return true;
    } catch (error) {
      console.error('Join document failed:', error);
      return false;
    }
  };

  const value = {
    isConnected,
    subscribe,
    unsubscribe,
    sendOperation,
    sendCursorUpdate,
    joinDocument
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};