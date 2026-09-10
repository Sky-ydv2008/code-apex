import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { Folder, FileCode, Plus, Trash2, FilePlus, Code2 } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const { files, activeFile, setActiveFile, createFile, deleteFile } = useRoom();
  const [showCreate, setShowCreate] = useState(false);
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    createFile(fileName.trim(), language);
    setFileName('');
    setShowCreate(false);
  };

  return (
    <div className="w-56 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Folder className="w-4 h-4 text-indigo-400" />
          <span>Files</span>
        </span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
          title="New File"
        >
          <FilePlus className="w-4 h-4" />
        </button>
      </div>

      {/* New File Inline Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="p-2 border-b border-slate-800 space-y-2 bg-slate-950/60">
          <input
            type="text"
            placeholder="Filename (e.g. app.js)"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1.5 py-0.5"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
            </select>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 flex items-center space-x-1">
          <Code2 className="w-3 h-3 text-slate-500" />
          <span>PROJECT ROOT</span>
        </div>

        {files.map((file) => {
          const isActive = activeFile?.id === file.id;
          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <FileCode className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate">{file.name}</span>
              </div>

              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${file.name}?`)) deleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Delete File"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
