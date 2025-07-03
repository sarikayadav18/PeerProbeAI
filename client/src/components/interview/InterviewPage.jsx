import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../editor/CodeEditor';

const InterviewPage = () => {
  // Get docId from URL params and userId from localStorage
  const { docId } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  // State for the components
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [initialContent, setInitialContent] = useState('');
  const [splitterPosition, setSplitterPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  
  // Video call box state
  const [videoCallPosition, setVideoCallPosition] = useState({ x: 20, y: 20 });
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const videoCallRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Fetch question and initial content (mock for now)
  useEffect(() => {
    // In a real app, you would fetch this data based on docId
    setQuestion(`Implement a function that reverses a string in ${language}.`);
    setInitialContent(`function reverseString(str) {\n  // Your code here\n}`);
  }, [docId, language]);

  // Handle splitter drag
  const handleSplitterMouseDown = (e) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = (e.clientX / window.innerWidth) * 100;
      setSplitterPosition(Math.max(20, Math.min(80, newPosition))); // Limit between 20% and 80%
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle video call box drag
  const handleVideoMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingVideo(true);
    dragStartPos.current = {
      x: e.clientX - videoCallPosition.x,
      y: e.clientY - videoCallPosition.y
    };
    document.addEventListener('mousemove', handleVideoMouseMove);
    document.addEventListener('mouseup', handleVideoMouseUp);
  };

  const handleVideoMouseMove = (e) => {
    if (isDraggingVideo && videoCallRef.current) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      
      // Get viewport dimensions minus the video call box dimensions
      const maxX = window.innerWidth - videoCallRef.current.offsetWidth;
      const maxY = window.innerHeight - videoCallRef.current.offsetHeight;
      
      setVideoCallPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleVideoMouseUp = () => {
    setIsDraggingVideo(false);
    document.removeEventListener('mousemove', handleVideoMouseMove);
    document.removeEventListener('mouseup', handleVideoMouseUp);
  };

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
        className="absolute top-0 bottom-0 w-2 bg-gray-200 hover:bg-gray-400 cursor-col-resize z-10"
        style={{ left: `${splitterPosition}%` }}
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
        />
      </div>

      {/* Video Call - Movable box */}
      <div
        ref={videoCallRef}
        className={`absolute w-72 h-64 bg-white border border-gray-300 rounded-lg shadow-md z-50 ${isDraggingVideo ? 'cursor-grabbing' : 'cursor-move'}`}
        style={{
          left: `${videoCallPosition.x}px`,
          top: `${videoCallPosition.y}px`,
        }}
        onMouseDown={handleVideoMouseDown}
      >
        <div className="p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg font-semibold">
          Video Call
        </div>
        <div className="h-[calc(100%-40px)] flex flex-col">
          {/* This would be replaced with your actual video call component */}
          <div className="flex-grow flex items-center justify-center bg-gray-200">
            Video feed would appear here
          </div>
          <div className="p-2 flex justify-center gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
              Mute
            </button>
            <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
              Camera Off
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;