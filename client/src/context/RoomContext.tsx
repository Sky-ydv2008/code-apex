import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, FileItem, ChatMessage, RoomTask, ExecutionResult, AIResponse } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ActiveMember {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  cursor?: { line: number; column: number; fileId?: string };
}

interface RoomContextType {
  room: Room | null;
  files: FileItem[];
  activeFile: FileItem | null;
  activeMembers: ActiveMember[];
  messages: ChatMessage[];
  tasks: RoomTask[];
  executionResult: ExecutionResult | null;
  isExecuting: boolean;
  aiResponse: AIResponse | null;
  isAILoading: boolean;
  activeAITab: string;
  setActiveAITab: (tab: string) => void;
  setActiveFile: (file: FileItem) => void;
  emitCodeUpdate: (content: string) => void;
  emitCursorUpdate: (line: number, column: number) => void;
  sendChatMessage: (message: string) => void;
  addTask: (title: string) => Promise<void>;
  toggleTask: (taskId: string, completed: boolean) => Promise<void>;
  createFile: (name: string, language: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  runCode: () => Promise<void>;
  runAI: (type: string, prompt?: string) => Promise<void>;
  applyAIFix: (fixedCode: string) => void;
  refreshRoom: (roomIdOrCode: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ roomIdOrCode: string; children: React.ReactNode }> = ({ roomIdOrCode, children }) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<RoomTask[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [activeAITab, setActiveAITab] = useState<string>('explain');

  const socketRef = useRef<Socket | null>(null);

  const refreshRoom = async (targetId: string) => {
    try {
      const res = await api.getRoom(targetId);
      setRoom(res.room);
      if (res.room.projects?.[0]?.files) {
        const loadedFiles = res.room.projects[0].files;
        setFiles(loadedFiles);
        if (!activeFile && loadedFiles.length > 0) {
          setActiveFile(loadedFiles[0]);
        } else if (activeFile) {
          const updatedActive = loadedFiles.find(f => f.id === activeFile.id);
          if (updatedActive) setActiveFile(updatedActive);
        }
      }
      if (res.room.tasks) setTasks(res.room.tasks);
      if (res.room.messages) setMessages(res.room.messages);
    } catch (err) {
      console.error('Failed to load room:', err);
    }
  };

  useEffect(() => {
    refreshRoom(roomIdOrCode);
  }, [roomIdOrCode]);

  useEffect(() => {
    if (!room || !user) return;

    const socket = io('/', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.emit('room:join', {
      roomId: room.id,
      user: { userId: user.id, name: user.name, avatar: user.avatar },
    });

    socket.on('room:members', (members: ActiveMember[]) => {
      setActiveMembers(members);
    });

    socket.on('user:joined', (data: { user: any; members: ActiveMember[] }) => {
      setActiveMembers(data.members);
    });

    socket.on('user:left', (data: { members: ActiveMember[] }) => {
      setActiveMembers(data.members);
    });

    socket.on('code:update', (data: { fileId: string; content: string }) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === data.fileId ? { ...f, content: data.content } : f))
      );
      setActiveFile((prev) => (prev && prev.id === data.fileId ? { ...prev, content: data.content } : prev));
    });

    socket.on('code:cursor', (data: { socketId: string; userId: string; name: string; fileId: string; cursor: any }) => {
      setActiveMembers((prev) =>
        prev.map((m) => (m.socketId === data.socketId ? { ...m, cursor: { ...data.cursor, fileId: data.fileId } } : m))
      );
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('file:tree_change', () => {
      refreshRoom(room.id);
    });

    return () => {
      socket.disconnect();
    };
  }, [room?.id, user?.id]);

  const emitCodeUpdate = (content: string) => {
    if (!activeFile || !room) return;
    setActiveFile((prev) => (prev ? { ...prev, content } : null));
    setFiles((prev) => prev.map((f) => (f.id === activeFile.id ? { ...f, content } : f)));

    socketRef.current?.emit('code:update', {
      roomId: room.id,
      fileId: activeFile.id,
      content,
      language: activeFile.language,
    });
  };

  const emitCursorUpdate = (line: number, column: number) => {
    if (!activeFile || !room) return;
    socketRef.current?.emit('code:cursor', {
      roomId: room.id,
      fileId: activeFile.id,
      cursor: { line, column },
    });
  };

  const sendChatMessage = (message: string) => {
    if (!room || !user || !message.trim()) return;
    socketRef.current?.emit('chat:send', {
      roomId: room.id,
      userId: user.id,
      message,
    });
  };

  const addTask = async (title: string) => {
    if (!room) return;
    const res = await api.addTask(room.id, title);
    setTasks((prev) => [...prev, res.task]);
    socketRef.current?.emit('task:update', { roomId: room.id, task: res.task });
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!room) return;
    const res = await api.toggleTask(taskId, completed);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
  };

  const createFile = async (name: string, language: string) => {
    if (!room || !room.projects?.[0]) return;
    const projectId = room.projects[0].id;
    const res = await api.createFile(projectId, name, name, language, '');
    setFiles((prev) => [...prev, res.file]);
    setActiveFile(res.file);
    socketRef.current?.emit('file:tree_change', { roomId: room.id });
  };

  const deleteFile = async (fileId: string) => {
    if (!room) return;
    await api.deleteFile(fileId);
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFile?.id === fileId && filtered.length > 0) {
        setActiveFile(filtered[0]);
      }
      return filtered;
    });
    socketRef.current?.emit('file:tree_change', { roomId: room.id });
  };

  const runCode = async () => {
    if (!activeFile) return;
    setIsExecuting(true);
    try {
      const res = await api.runCode(activeFile.content, activeFile.language);
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: `Execution failed: ${err.message}`,
        exitCode: 1,
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const runAI = async (type: string, prompt?: string) => {
    if (!activeFile) return;
    setIsAILoading(true);
    setActiveAITab(type);
    try {
      const res = await api.processAI(type, activeFile.content, prompt, activeFile.language, room?.id);
      setAiResponse(res);
    } catch (err: any) {
      setAiResponse({
        type,
        result: `AI processing failed: ${err.message}`,
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const applyAIFix = (fixedCode: string) => {
    if (!activeFile) return;
    emitCodeUpdate(fixedCode);
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        files,
        activeFile,
        activeMembers,
        messages,
        tasks,
        executionResult,
        isExecuting,
        aiResponse,
        isAILoading,
        activeAITab,
        setActiveAITab,
        setActiveFile,
        emitCodeUpdate,
        emitCursorUpdate,
        sendChatMessage,
        addTask,
        toggleTask,
        createFile,
        deleteFile,
        runCode,
        runAI,
        applyAIFix,
        refreshRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
