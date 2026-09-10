import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { RoomProvider, useRoom } from '../context/RoomContext';
import { MonacoWorkspace } from '../components/editor/MonacoWorkspace';
import { FileExplorer } from '../components/editor/FileExplorer';
import { TerminalPanel } from '../components/terminal/TerminalPanel';
import { AIAssistantPanel } from '../components/ai/AIAssistantPanel';
import { RoomChat } from '../components/chat/RoomChat';
import { RoomTasks } from '../components/tasks/RoomTasks';
import { RoomMembersBar } from '../components/members/RoomMembersBar';
import { Download, MessageSquare, CheckSquare, Folder, Sparkles, Copy, Check } from 'lucide-react';
import { api } from '../services/api';

const WorkspaceContent: React.FC = () => {
  const { room } = useRoom();
  const [activeLeftTab, setActiveLeftTab] = useState<'files' | 'chat' | 'tasks'>('files');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    if (!room?.projects?.[0]) return;
    try {
      const projectId = room.projects[0].id;
      const res = await api.exportProject(projectId);

      const blob = new Blob([res.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${room.name.replace(/\s+/g, '_')}_export.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export project');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Presence & Quick Bar */}
      <RoomMembersBar />

      {/* Workspace Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far-Left Dock Navigation Icons */}
        <div className="w-12 border-r border-slate-800 bg-slate-950 flex flex-col items-center py-3 space-y-4 select-none">
          <button
            onClick={() => setActiveLeftTab('files')}
            className={`p-2 rounded-xl transition ${
              activeLeftTab === 'files'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Files Explorer"
          >
            <Folder className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveLeftTab('chat')}
            className={`p-2 rounded-xl transition ${
              activeLeftTab === 'chat'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Team Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveLeftTab('tasks')}
            className={`p-2 rounded-xl transition ${
              activeLeftTab === 'tasks'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Room Tasks"
          >
            <CheckSquare className="w-5 h-5" />
          </button>

          <div className="mt-auto space-y-3">
            <button
              onClick={handleCopyCode}
              className="p-2 text-slate-400 hover:text-indigo-400 transition"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleExport}
              className="p-2 text-slate-400 hover:text-indigo-400 transition"
              title="Export Project (Markdown)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Left Panel Content */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col">
          {activeLeftTab === 'files' && <FileExplorer />}
          {activeLeftTab === 'chat' && <RoomChat />}
          {activeLeftTab === 'tasks' && <RoomTasks />}
        </div>

        {/* Central Editor & Terminal Stack */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <MonacoWorkspace />
          <TerminalPanel />
        </div>

        {/* Right AI Copilot Panel */}
        <AIAssistantPanel />
      </div>
    </div>
  );
};

export const RoomWorkspacePage: React.FC = () => {
  const { idOrCode } = useParams<{ idOrCode: string }>();

  if (!idOrCode) return <div>Invalid Room ID</div>;

  return (
    <RoomProvider roomIdOrCode={idOrCode}>
      <WorkspaceContent />
    </RoomProvider>
  );
};
