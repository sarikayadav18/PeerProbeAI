import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPanel.module.css';

const ChatPanel = ({ messages, onSendMessage, currentUser }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.chatPanel}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.userId === currentUser.id ? styles.myMessage : styles.otherMessage}>
            <div className={styles.messageHeader}>
              <span className={styles.sender} style={{ color: msg.color }}>
                {msg.userId === currentUser.id ? 'You' : msg.name}
              </span>
              <span className={styles.time}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.messageForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>Send</button>
      </form>
    </div>
  );
};

export default ChatPanel;