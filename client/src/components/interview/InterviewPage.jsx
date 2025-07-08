import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../editor/CodeEditor';
import axios from 'axios';
import VideoCallComponent from './VideoCallComponent'; // Import the VideoCallComponent

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

const InterviewPage = () => {
  const { docId } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const token = user?.token;
  const [peerId, setPeerId] = useState(null); // State to track the peer ID

  // State for the components
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [initialContent, setInitialContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Splitter state
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  
  // Video call box state
  const [videoCallPosition, setVideoCallPosition] = useState({ x: 20, y: 20 });
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoCallRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Fetch document data from backend
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/documents/${docId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { content, title, participants } = response.data;
        
        setQuestion(title || 'Interview Question');
        setInitialContent(content || '');

        console.log("participant", participants);

        // Find the peer ID (first participant that's not the current user)
        if (participants && participants.length > 0) {
          const peer = participants.find(p => Number(p) != userId);
          if (peer) setPeerId(peer);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load document');
        setIsLoading(false);
        console.error('Error fetching document:', err);
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };

    if (token && docId) {
      fetchDocument();
    } else {
      setError('Missing authentication token');
      setIsLoading(false);
    }
  }, [docId, token, userId]);

  // Handle splitter drag (keep existing implementation)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSplitter) {
        e.preventDefault();
        const newPosition = (e.clientX / window.innerWidth) * 100;
        setSplitterPosition(Math.max(20, Math.min(80, newPosition)));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDraggingSplitter) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter]);

  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  // Handle video call box drag (keep existing implementation)
  useEffect(() => {
    const handleVideoMouseMove = (e) => {
      if (isDraggingVideo && videoCallRef.current) {
        e.preventDefault();
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        
        const maxX = window.innerWidth - videoCallRef.current.offsetWidth;
        const maxY = window.innerHeight - videoCallRef.current.offsetHeight;
        
        setVideoCallPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleVideoMouseUp = () => {
      if (isDraggingVideo) {
        setIsDraggingVideo(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isDraggingVideo) {
      document.addEventListener('mousemove', handleVideoMouseMove);
      document.addEventListener('mouseup', handleVideoMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleVideoMouseMove);
      document.removeEventListener('mouseup', handleVideoMouseUp);
    };
  }, [isDraggingVideo]);

  const handleVideoMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingVideo(true);
    
    const rect = videoCallRef.current.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Left side - Question */}
      <div 
        className="h-full overflow-y-auto p-5 bg-gray-50 border-r border-gray-200"
        style={{ width: `${splitterPosition}%` }}
      >
        <h2 className="text-xl font-bold">Interview Question</h2>
        <div className="mt-5 whitespace-pre-wrap leading-relaxed">
          {question}
        </div>
      </div>

      {/* Splitter */}
      <div 
        className="absolute top-0 bottom-0 w-2 bg-gray-200 hover:bg-gray-400 cursor-col-resize z-10 transition-colors"
        style={{ left: `${splitterPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleSplitterMouseDown}
      />

      {/* Right side - Code Editor */}
      <div 
        className="h-full overflow-hidden p-5"
        style={{ width: `${100 - splitterPosition}%` }}
      >
        <CodeEditor 
          docId={docId}
          userId={userId}
          initialContent={initialContent}
          language={language}
          token={token}
        />
      </div>

      {/* Video Call - Movable box */}
      <div
        ref={videoCallRef}
        className={`absolute w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 transition-shadow ${
          isDraggingVideo ? 'cursor-grabbing shadow-xl' : 'cursor-move'
        }`}
        style={{
          left: `${videoCallPosition.x}px`,
          top: `${videoCallPosition.y}px`,
        }}
        onMouseDown={handleVideoMouseDown}
      >
        {/* Replace the placeholder content with VideoCallComponent */}
        <VideoCallComponent 
          targetUserId={peerId} 
          onDragStart={(e) => {
            // Prevent drag events from propagating to the parent div
            e.stopPropagation();
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}
        />
      </div>
    </div>
  );
};

export default InterviewPage;