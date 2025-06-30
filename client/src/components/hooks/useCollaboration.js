import { useState, useEffect, useCallback } from 'react';

const useCollaboration = (roomId, userId) => {
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const handleIncomingMessage = useCallback((message) => {
    switch (message.type) {
      case 'content_update':
        setContent(message.content);
        break;
      case 'cursor_update':
        setUsers(prev => updateUserCursors(prev, message));
        break;
      case 'chat_message':
        setChatMessages(prev => [...prev, message]);
        break;
      case 'user_joined':
        setUsers(prev => [...prev, message.user]);
        break;
      case 'user_left':
        setUsers(prev => prev.filter(u => u.id !== message.userId));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const updateUserCursors = (users, message) => {
    const userIndex = users.findIndex(u => u.id === message.userId);
    if (userIndex >= 0) {
      const updated = [...users];
      updated[userIndex] = { ...updated[userIndex], cursor: message.cursor };
      return updated;
    }
    return users;
  };

  return {
    content,
    users,
    chatMessages,
    handleIncomingMessage,
    setContent
  };
};

export default useCollaboration;