import React, { useState, useEffect, useRef } from 'react';

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg ${msg.userId === currentUser.id ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-semibold" style={{ color: msg.color }}>
                {msg.userId === currentUser.id ? 'You' : msg.name}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div 
              className={`rounded-lg px-4 py-2 mt-1 ${msg.userId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;