import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useRoom } from '../../context/RoomContext';
import { FileCode, Play, Sparkles, X, Plus } from 'lucide-react';

export const MonacoWorkspace: React.FC = () => {
  const {
    files,
    activeFile,
    setActiveFile,
    emitCodeUpdate,
    emitCursorUpdate,
    runCode,
    runAI,
    isExecuting,
    createFile,
    deleteFile,
  } = useRoom();

  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      emitCursorUpdate(e.position.lineNumber, e.position.column);
    });
  };

  const handleCreateNewFile = () => {
    const filename = prompt('Enter new file name (e.g. utils.js or helper.py):');
    if (!filename) return;
    const lang = filename.endsWith('.py') ? 'python' : 'javascript';
    createFile(filename, lang);
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500 space-y-3 p-6">
        <FileCode className="w-12 h-12 text-slate-700" />
        <p className="text-sm font-medium">No file selected in workspace</p>
        <button
          onClick={handleCreateNewFile}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New File</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Workspace Tabs & Action Bar */}
      <div className="h-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between px-2 overflow-x-auto">
        {/* Open Files Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-t-lg text-xs font-mono border-t-2 cursor-pointer transition ${
                activeFile.id === file.id
                  ? 'bg-slate-950 text-indigo-300 border-indigo-500 font-semibold'
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>{file.name}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${file.name}?`)) deleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleCreateNewFile}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
            title="Create File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => runAI('explain')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Explain</span>
          </button>

          <button
            onClick={runCode}
            disabled={isExecuting}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile.language}
          value={activeFile.content}
          onChange={(value) => emitCodeUpdate(value || '')}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            tabSize: 2,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};
