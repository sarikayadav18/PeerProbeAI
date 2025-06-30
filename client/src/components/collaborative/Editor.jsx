import React, { useState, useEffect, useRef } from 'react';
import UserCursor from './UserCursor';
import Toolbar from './Toolbar';
import styles from './Editor.module.css';

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
    <div className={styles.editorContainer}>
      <Toolbar />
      <div className={styles.editorWrapper}>
        <textarea
          ref={editorRef}
          className={styles.editor}
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