import React, { useState, useEffect, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
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
  const ignoreChangesRef = useRef(false);

  const {
    isConnected,
    onOperation,
    onCursorUpdate,
    onParticipantsUpdate,
    broadcastOperation,
    broadcastCursorUpdate,
    getParticipants
  } = useWebSocket(docId, userId);

  // Fetch initial participants
  useEffect(() => {
    if (!docId) return;
    getParticipants().then(setParticipants);
  }, [docId, getParticipants]);

  // Incoming operations
  useEffect(() => {
    const unsubscribeOps = onOperation(op => {
      if (op.userId === userId) return;
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

  // Incoming cursor updates: render decorations
  useEffect(() => {
    const unsubscribeCursors = onCursorUpdate(({ userId: peerId, cursorData }) => {
      if (peerId === userId || !editorRef.current) return;

      // Remove old decorations for this peer
      const removeIds = decorationsRef.current
        .filter(d => ['cursor-' + peerId, 'selection-' + peerId].includes(d.options.className))
        .map(d => d.id);

      editorRef.current.deltaDecorations(removeIds, []);
      decorationsRef.current = decorationsRef.current.filter(d => !removeIds.includes(d.id));

      if (cursorData) {
        const newDecs = [];
        const { position, selection } = cursorData;

        if (position) {
          newDecs.push({
            range: new monacoEditor.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            options: { className: `cursor-${peerId}` }
          });
        }
        if (selection && !selection.isEmpty) {
          newDecs.push({
            range: new monacoEditor.Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.endLineNumber,
              selection.endColumn
            ),
            options: { className: `selection-${peerId}` }
          });
        }

        const newIds = editorRef.current.deltaDecorations([], newDecs);
        decorationsRef.current.push(...newIds.map((id, i) => ({ id, options: newDecs[i].options })));
      }
    });
    return () => unsubscribeCursors();
  }, [onCursorUpdate, userId]);

  // Participant updates
  useEffect(() => {
    const unsubscribeParticipants = onParticipantsUpdate(setParticipants);
    return () => unsubscribeParticipants();
  }, [onParticipantsUpdate]);

  // Editor change handler
  const handleEditorChange = (newValue, event) => {
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
  };

  // Debounced broadcast cursor
  const debounceBroadcast = useMemo(
    () => debounce(() => {
      if (!editorRef.current || ignoreChangesRef.current) return;
      const position = editorRef.current.getPosition();
      const selection = editorRef.current.getSelection();
      // Always broadcast both position & selection
      broadcastCursorUpdate({ position, selection: selection.isEmpty() ? null : selection });
    }, 100),
    [broadcastCursorUpdate]
  );

  // Mount editor
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Send initial cursor state
    debounceBroadcast();
    // Track future movements
    editor.onDidChangeCursorPosition(debounceBroadcast);
    editor.onDidChangeCursorSelection(debounceBroadcast);
  };

  const handleLanguageChange = newLang => setLanguageMode(newLang);

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
          options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true }}
        />
        {/* <UserList participants={participants} currentUser={userId} /> */}
      </div>
    </div>
  );
};

export default CodeEditor;
