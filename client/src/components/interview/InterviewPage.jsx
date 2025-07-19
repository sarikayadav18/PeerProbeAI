import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../editor/CodeEditor';
import axios from 'axios';
import VideoCallComponent from './VideoCallComponent';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

const InterviewPage = () => {
  const { docId, questionId } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const token = user?.token;
  const [peerId, setPeerId] = useState(null);
  const [question, setQuestion] = useState({ name: '', description: '' });
  const [testCases, setTestCases] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [initialContent, setInitialContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splitterPosition, setSplitterPosition] = useState(50);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [videoCallPosition, setVideoCallPosition] = useState({ x: 20, y: 20 });
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoCallRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Fetch document and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch document
        const docResponse = await api.get(`/api/documents/${docId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const { content, participants } = docResponse.data;
        setInitialContent(content || '');
        
        // Find the peer ID
        if (participants && participants.length > 0) {
          const peer = participants.find(p => Number(p) != userId);
          if (peer) setPeerId(Number(peer));
        }

        // Fetch question if questionId is provided
        if (questionId) {
          const questionResponse = await api.get(`/api/questions/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setQuestion({
            name: questionResponse.data.name,
            description: questionResponse.data.description
          });

          // Fetch test cases for the question
          const testCasesResponse = await api.get(`/api/test-cases/by-question/${questionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setTestCases(testCasesResponse.data);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
        setIsLoading(false);
        console.error('Error:', err);
        
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };

    if (token && docId) {
      fetchData();
    } else {
      setError('Missing authentication token');
      setIsLoading(false);
    }
  }, [docId, questionId, token, userId]);

  // Handle splitter drag
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

  // Handle video call box drag
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
        <h2 className="text-xl font-bold mb-4">{question.name}</h2>
        <div className="mb-6 whitespace-pre-wrap leading-relaxed">
          {question.description}
        </div>

        {/* Test Cases Section */}
        {testCases.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Test Cases:</h3>
            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div key={tc.id} className="p-3 bg-gray-100 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Input:</p>
                      <p className="font-mono text-sm">{tc.input}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expected Output:</p>
                      <p className="font-mono text-sm">{tc.output}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        <VideoCallComponent 
          targetUserId={peerId} 
          onDragStart={(e) => e.stopPropagation()}
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