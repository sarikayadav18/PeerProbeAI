import React, { useState, useEffect, useRef } from 'react';
import UserCursor from './UserCursor';
import Toolbar from './Toolbar';

const Editor = ({ content, onContentChange, users, currentUser }) => {
  const editorRef = useRef(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const handleChange = (e) => {
    const newContent = e.target.value;
    onContentChange(newContent);
    updateCursorPosition();
  };

  const updateCursorPosition = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      setSelection({ start, end });
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keyup', updateCursorPosition);
      editor.addEventListener('click', updateCursorPosition);
      return () => {
        editor.removeEventListener('keyup', updateCursorPosition);
        editor.removeEventListener('click', updateCursorPosition);
      };
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <Toolbar />
      <div className="relative flex-1 p-4">
        <textarea
          ref={editorRef}
          className="w-full h-full p-4 font-mono text-gray-800 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          value={content}
          onChange={handleChange}
          spellCheck="false"
        />
        {users.map(user => (
          user.id !== currentUser.id && user.cursor && (
            <UserCursor
              key={user.id}
              position={user.cursor}
              color={user.color}
              name={user.name}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default Editor;