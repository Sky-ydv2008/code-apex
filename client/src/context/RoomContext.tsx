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
  socket: Socket | null;
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

export const RoomProvider: React.FC<{ roomIdOrCode: string; children: React.ReactNode }> = ({
  roomIdOrCode,
  children,
}) => {
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFileState] = useState<FileItem | null>(null);
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<RoomTask[]>([]);

  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [activeAITab, setActiveAITab] = useState('explain');

  const socketRef = useRef<Socket | null>(null);

  const refreshRoom = async (targetIdOrCode: string) => {
    try {
      const res = await api.getRoom(targetIdOrCode);
      setRoom(res.room);

      if (res.room.projects?.[0]?.files) {
        setFiles(res.room.projects[0].files);
        if (!activeFile && res.room.projects[0].files.length > 0) {
          setActiveFileState(res.room.projects[0].files[0]);
        }
      }

      if (res.room.tasks) {
        setTasks(res.room.tasks);
      }
      if (res.room.messages) {
        setMessages(res.room.messages);
      }
    } catch (err) {
      console.error('Failed to load room details:', err);
    }
  };

  useEffect(() => {
    refreshRoom(roomIdOrCode);

    const socketServerUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketServerUrl);
    socketRef.current = socket;

    if (user && room) {
      socket.emit('room:join', {
        roomId: room.id,
        user: { userId: user.id, name: user.name, avatar: user.avatar },
      });
    }

    socket.on('room:members', (members: ActiveMember[]) => {
      setActiveMembers(members);
    });

    socket.on('user:joined', (data: { socketId: string; user: { userId: string; name: string; avatar?: string } }) => {
      setActiveMembers((prev) => [...prev.filter((m) => m.socketId !== data.socketId), { socketId: data.socketId, ...data.user }]);
    });

    socket.on('user:left', (data: { socketId: string }) => {
      setActiveMembers((prev) => prev.filter((m) => m.socketId !== data.socketId));
    });

    socket.on('code:update', (data: { fileId: string; content: string }) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === data.fileId ? { ...f, content: data.content } : f))
      );
      if (activeFile?.id === data.fileId) {
        setActiveFileState((prev) => (prev ? { ...prev, content: data.content } : null));
      }
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('task:update', (updatedTask: RoomTask) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === updatedTask.id);
        if (exists) {
          return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        }
        return [...prev, updatedTask];
      });
    });

    return () => {
      socket.emit('room:leave');
      socket.disconnect();
    };
  }, [roomIdOrCode, user?.id, room?.id]);

  const setActiveFile = (file: FileItem) => {
    setActiveFileState(file);
  };

  const emitCodeUpdate = (content: string) => {
    if (!activeFile || !room) return;
    setActiveFileState((prev) => (prev ? { ...prev, content } : null));
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
    const createdTask = res.task as RoomTask;
    setTasks((prev) => [...prev, createdTask]);
    socketRef.current?.emit('task:update', { roomId: room.id, task: createdTask });
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!room) return;
    const res = await api.toggleTask(taskId, completed);
    const updatedTask = res.task as RoomTask;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
  };

  const createFile = async (name: string, language: string) => {
    if (!room || !room.projects?.[0]) return;
    const projectId = room.projects[0].id;
    const res = await api.createFile(projectId, name, name, language, '');
    setFiles((prev) => [...prev, res.file]);
    setActiveFileState(res.file);
    socketRef.current?.emit('file:tree_change', { roomId: room.id });
  };

  const deleteFile = async (fileId: string) => {
    if (!room) return;
    await api.deleteFile(fileId);
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      if (activeFile?.id === fileId && filtered.length > 0) {
        setActiveFileState(filtered[0]);
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
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Execution failed';
      setExecutionResult({
        stdout: '',
        stderr: `Execution failed: ${msg}`,
        exitCode: 1,
        executionTimeMs: 0,
        error: msg,
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
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'AI processing failed';
      setAiResponse({
        id: Date.now().toString(),
        type,
        input: activeFile.content,
        output: `AI processing failed: ${msg}`,
        createdAt: new Date().toISOString(),
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
        socket: socketRef.current,
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
