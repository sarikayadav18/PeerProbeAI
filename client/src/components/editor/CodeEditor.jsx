import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import { useWebSocket } from '../../hooks/useWebSocket';
import EditorToolbar from './EditorToolbar';
import UserList from './UserList';
import debounce from 'lodash.debounce';

const CodeEditor = ({ docId, userId, userName = 'You', initialContent = '', language = 'javascript' }) => {
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(0);
  const [participants, setParticipants] = useState([{ id: userId, name: userName }]);
  const [languageMode, setLanguageMode] = useState(language);
  const editorRef = useRef(null);
  const decorationsRef = useRef({});
  const ignoreChangesRef = useRef(false);
  const userColorsRef = useRef({});
  const activeUsersRef = useRef(new Set([userId]));

  const {
    isConnected,
    onOperation,
    onCursorUpdate,
    onParticipantsUpdate,
    broadcastOperation,
    broadcastCursorUpdate,
    getParticipants
  } = useWebSocket(docId, userId);

  // Generate or retrieve colors for each user
  const getUserColor = useCallback((peerId) => {
    if (!userColorsRef.current[peerId]) {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F06292', '#7986CB', '#9575CD'
      ];
      const index = parseInt(peerId) % colors.length;
      userColorsRef.current[peerId] = colors[index];
    }
    return userColorsRef.current[peerId];
  }, []);

  // Enhanced participant management
  const updateParticipants = useCallback((newParticipants) => {
    // Ensure current user is always included
    if (!newParticipants.some(p => p.id === userId)) {
      newParticipants.push({ id: userId, name: userName });
    }

    // Update active users
    activeUsersRef.current = new Set(newParticipants.map(p => p.id));
    
    setParticipants(newParticipants);
  }, [userId, userName]);

  // Fetch initial participants
  useEffect(() => {
    if (!docId) return;
    
    const fetchParticipants = async () => {
      try {
        const fetchedParticipants = await getParticipants();
        console.log("Fetched participants:", fetchedParticipants);
        updateParticipants(fetchedParticipants);
      } catch (error) {
        console.error('Error fetching participants:', error);
        updateParticipants([{ id: userId, name: userName }]);
      }
    };
    
    fetchParticipants();
  }, [docId, getParticipants, userId, userName, updateParticipants]);

  // Handle participant updates from WebSocket
  useEffect(() => {
    const unsubscribeParticipants = onParticipantsUpdate(updateParticipants);
    return () => unsubscribeParticipants();
  }, [onParticipantsUpdate, updateParticipants]);

  // Handle incoming edit operations
  useEffect(() => {
    const unsubscribeOps = onOperation(op => {
      if (op.userId === userId) return;
      
      // Track active users
      activeUsersRef.current.add(op.userId);
      
      setRevision(op.revision);
      ignoreChangesRef.current = true;
      try {
        setContent(prev => {
          if (op.type === 'INSERT') {
            return prev.slice(0, op.position) + op.text + prev.slice(op.position);
          } else if (op.type === 'DELETE') {
            return prev.slice(0, op.position) + prev.slice(op.position + op.length);
          }
          return prev;
        });
      } finally {
        ignoreChangesRef.current = false;
      }
    });
    return () => unsubscribeOps();
  }, [onOperation, userId]);

  // Handle cursor updates and render decorations
  useEffect(() => {
    const unsubscribeCursors = onCursorUpdate(({ userId: peerId, position, selection }) => {
      if (!editorRef.current) return;

      // Track active users
      if (peerId && peerId !== userId) {
        activeUsersRef.current.add(peerId);
      }

      if (peerId === userId) return;

      // Remove old decorations for this peer
      if (decorationsRef.current[peerId]) {
        editorRef.current.deltaDecorations(decorationsRef.current[peerId], []);
        delete decorationsRef.current[peerId];
      }

      if (!position && !selection) return;

      const userColor = getUserColor(peerId);
      const newDecs = [];
      
      // Create cursor decoration
      if (position) {
        newDecs.push({
          range: new monacoEditor.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column + 1
          ),
          options: {
            className: `remote-cursor-${peerId}`,
            inlineClassName: `remote-cursor-inline-${peerId}`,
            glyphMarginClassName: `remote-cursor-glyph-${peerId}`,
            stickiness: monacoEditor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        });

        // Add user name label
        const peerName = participants.find(p => p.id === peerId)?.name || `User ${peerId}`;
        newDecs.push({
          range: new monacoEditor.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          options: {
            afterContentClassName: `remote-cursor-label-${peerId}`,
            after: {
              content: peerName,
              inlineClassName: `remote-cursor-label-inline-${peerId}`
            }
          }
        });
      }

      // Create selection decoration
      if (selection && !selection.isEmpty) {
        newDecs.push({
          range: new monacoEditor.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `remote-selection-${peerId}`,
            isWholeLine: false
          }
        });
      }

      // Apply decorations
      const newIds = editorRef.current.deltaDecorations([], newDecs);
      decorationsRef.current[peerId] = newIds;

      // Add dynamic styles for this user's cursor
      const styleId = `cursor-style-${peerId}`;
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      
      style.textContent = `
        .remote-cursor-${peerId} {
          background-color: ${userColor};
          opacity: 0.7;
          width: 2px !important;
        }
        .remote-cursor-inline-${peerId} {
          background-color: ${userColor};
          opacity: 0.3;
        }
        .remote-cursor-glyph-${peerId} {
          background-color: ${userColor};
        }
        .remote-cursor-label-${peerId} {
          background-color: ${userColor};
          color: white;
          border-radius: 2px;
          padding: 0 4px;
          margin-left: 2px;
          font-size: 12px;
        }
        .remote-selection-${peerId} {
          background-color: ${userColor}20;
        }
      `;
    });

    return () => {
      unsubscribeCursors();
      // Clean up all cursor styles
      Object.keys(decorationsRef.current).forEach(peerId => {
        const style = document.getElementById(`cursor-style-${peerId}`);
        if (style) document.head.removeChild(style);
      });
    };
  }, [onCursorUpdate, userId, participants, getUserColor]);

  // Editor change handler
  const handleEditorChange = useCallback((newValue, event) => {
    if (ignoreChangesRef.current || event.isUndoing || event.isRedoing) return;
    setContent(newValue);
    event.changes.forEach(change => {
      const op = {
        type: change.text ? 'INSERT' : 'DELETE',
        position: change.rangeOffset,
        text: change.text,
        length: change.rangeLength,
        revision: revision + 1,
        userId
      };
      broadcastOperation(op);
      setRevision(r => r + 1);
    });
  }, [broadcastOperation, revision, userId]);

  // Cursor broadcast handler
  const handleCursorChange = useCallback(() => {
    if (!editorRef.current || ignoreChangesRef.current) return;
    const position = editorRef.current.getPosition();
    const selection = editorRef.current.getSelection();
    
    broadcastCursorUpdate({ 
      position, 
      selection: selection.isEmpty() ? null : selection,
      userId
    });
  }, [broadcastCursorUpdate, userId]);

  // Debounced cursor broadcast
  const debouncedCursorBroadcast = useMemo(
    () => debounce(handleCursorChange, 100),
    [handleCursorChange]
  );

  // Mount editor
  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor;
    
    // Send initial cursor state
    handleCursorChange();
    
    // Track cursor movements
    const disposables = [
      editor.onDidChangeCursorPosition(debouncedCursorBroadcast),
      editor.onDidChangeCursorSelection(debouncedCursorBroadcast),
      editor.onDidBlurEditorText(() => {
        broadcastCursorUpdate({ position: null, selection: null, userId });
      })
    ];
    
    return () => {
      disposables.forEach(d => d.dispose());
    };
  }, [debouncedCursorBroadcast, broadcastCursorUpdate, handleCursorChange, userId]);

  const handleLanguageChange = useCallback((newLang) => {
    setLanguageMode(newLang);
  }, []);

  return (
    <div className="code-editor-container">
      <EditorToolbar
        language={languageMode}
        onLanguageChange={handleLanguageChange}
        connectionStatus={isConnected ? 'connected' : 'disconnected'}
      />
      <div className="editor-content">
        <Editor
          height="80vh"
          language={languageMode}
          value={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{ 
            minimap: { enabled: false }, 
            fontSize: 14, 
            wordWrap: 'on', 
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            renderControlCharacters: true,
            renderWhitespace: 'selection'
          }}
        />
        <UserList 
          participants={participants} 
          currentUser={userId} 
          getUserColor={getUserColor}
        />
      </div>
    </div>
  );
};

export default CodeEditor;