import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '../../hooks/useWebSocket';
import EditorToolbar from './EditorToolbar';
import UserList from './UserList';
import debounce from 'lodash.debounce';

const CodeEditor = ({ docId, userId, initialContent = '', language = 'javascript' }) => {
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [languageMode, setLanguageMode] = useState(language);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  
  const {
    isConnected,
    onOperation,
    onCursorUpdate,
    onParticipantsUpdate,
    broadcastOperation,
    broadcastCursorUpdate,
    getParticipants
  } = useWebSocket(docId, userId);

  // Initialize editor and set up collaboration
  useEffect(() => {
    if (!docId) return;

    const fetchParticipants = async () => {
      const users = await getParticipants();
      setParticipants(users);
    };

    fetchParticipants();

    // Handle incoming operations from other users
    const unsubscribeOps = onOperation((operation) => {
      if (operation.userId === userId) return;

      setRevision(operation.revision);
      
      switch (operation.type) {
        case 'INSERT':
          setContent(prev => 
            prev.slice(0, operation.position) + 
            operation.text + 
            prev.slice(operation.position)
          );
          break;
        case 'DELETE':
          setContent(prev => 
            prev.slice(0, operation.position) + 
            prev.slice(operation.position + operation.length)
          );
          break;
        default:
          console.warn('Unknown operation type:', operation.type);
      }
    });

    // Handle cursor updates from other users
    const unsubscribeCursors = onCursorUpdate(({ userId: peerId, cursorData }) => {
      if (peerId === userId || !editorRef.current) return;

      // Remove previous decorations for this user
      decorationsRef.current = decorationsRef.current.filter(
        dec => dec.options.className !== `cursor-${peerId}`
      );

      if (cursorData) {
        const { position, selection } = cursorData;
        const newDecorations = [];

        // Add cursor decoration
        if (position) {
          newDecorations.push({
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column + 1
            ),
            options: {
              className: `cursor-${peerId}`,
              hoverMessage: { value: `User: ${peerId}` },
              stickiness: 1 /* Never grow when typing at edges */
            }
          });
        }

        // Add selection decoration if exists
        if (selection) {
          newDecorations.push({
            range: new monaco.Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.endLineNumber,
              selection.endColumn
            ),
            options: {
              className: `selection-${peerId}`,
              isWholeLine: false
            }
          });
        }

        // Apply new decorations
        const ids = editorRef.current.deltaDecorations([], newDecorations);
        decorationsRef.current.push(...ids.map((id, i) => ({
          id,
          options: newDecorations[i].options
        })));
      }
    });

    // Handle participant updates
    const unsubscribeParticipants = onParticipantsUpdate(setParticipants);

    return () => {
      unsubscribeOps();
      unsubscribeCursors();
      unsubscribeParticipants();
    };
  }, [docId, userId, onOperation, onCursorUpdate, onParticipantsUpdate, getParticipants]);

  // Handle editor changes
  const handleEditorChange = (newValue, event) => {
    if (!event.changes || event.isUndoing || event.isRedoing) {
      return;
    }

    setContent(newValue);

    // Create and broadcast operations for each change
    event.changes.forEach(change => {
      const operation = {
        type: change.text ? 'INSERT' : 'DELETE',
        position: change.rangeOffset,
        text: change.text,
        length: change.rangeLength,
        revision: revision + 1
      };

      broadcastOperation(operation);
    });

    setRevision(prev => prev + 1);
  };

  // Broadcast cursor position (debounced)
  const broadcastCursorPosition = debounce(() => {
    if (!editorRef.current) return;

    const selection = editorRef.current.getSelection();
    const position = editorRef.current.getPosition();

    broadcastCursorUpdate({
      position,
      selection: selection && !selection.isEmpty() ? selection : null
    });
  }, 100);

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Set up cursor tracking
    editor.onDidChangeCursorPosition(broadcastCursorPosition);
    editor.onDidChangeCursorSelection(broadcastCursorPosition);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguageMode(newLanguage);
  };

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
            automaticLayout: true
          }}
        />
        
        <UserList participants={participants} currentUser={userId} />
      </div>
    </div>
  );
};

export default CodeEditor;