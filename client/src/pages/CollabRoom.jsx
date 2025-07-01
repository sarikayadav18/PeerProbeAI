import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';
import useCollaboration from '../hooks/useCollaboration';
import Editor from '../components/editor/Editor';
import ChatPanel from '../components/editor/ChatPanel';

const CollabRoom = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const {
    content,
    users,
    chatMessages,
    handleIncomingMessage,
    setContent
  } = useCollaboration(roomId, currentUser?.id);

  const { sendMessage } = useWebSocket(
    `ws://localhost:8080/ws?roomId=${roomId}&userId=${currentUser?.id}`,
    handleIncomingMessage
  );

  const handleContentChange = (newContent) => {
    setContent(newContent);
    sendMessage({
      type: 'content_update',
      content: newContent,
      roomId,
      userId: currentUser.id
    });
  };

  const handleSendChatMessage = (message) => {
    sendMessage({
      type: 'chat_message',
      content: message,
      roomId,
      userId: currentUser.id,
      name: currentUser.name,
      color: currentUser.color,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Editor Section - Takes 70% of width by default, full width on small screens */}
      <div className="w-full lg:w-3/4 h-full border-r border-gray-200">
        <Editor
          content={content}
          onContentChange={handleContentChange}
          users={users}
          currentUser={currentUser}
        />
      </div>
      
      {/* Chat Section - Hidden on small screens, shown as sidebar on larger screens */}
      <div className="hidden lg:flex lg:w-1/4 h-full flex-col bg-white">
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          currentUser={currentUser}
        />
      </div>
      
      {/* Mobile Chat Toggle Button (optional) */}
      <button className="lg:hidden fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};

export default CollabRoom;