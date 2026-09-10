import { User, Room, Project, FileItem, AIResponse, ExecutionResult, Challenge, LeaderboardUser } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('codecraft_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data as T;
}

export const api = {
  // Auth
  register: (name: string, email: string, pass: string) =>
    fetchJSON<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass }),
    }),

  login: (email: string, pass: string) =>
    fetchJSON<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    }),

  getMe: () => fetchJSON<{ user: User }>('/auth/me'),

  // Rooms
  createRoom: (name: string, description: string, language: string, isPublic: boolean) =>
    fetchJSON<{ room: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description, language, isPublic }),
    }),

  getRoom: (idOrCode: string) => fetchJSON<{ room: Room }>(`/rooms/${idOrCode}`),

  joinRoom: (roomCode: string) =>
    fetchJSON<{ roomId: string; roomCode: string }>('/rooms/join', {
      method: 'POST',
      body: JSON.stringify({ roomCode }),
    }),

  getPublicRooms: () => fetchJSON<{ rooms: Room[] }>('/rooms/public'),
  getUserRooms: () => fetchJSON<{ rooms: Room[] }>('/rooms/my-rooms'),

  addTask: (roomId: string, title: string) =>
    fetchJSON<{ task: any }>('/rooms/tasks', {
      method: 'POST',
      body: JSON.stringify({ roomId, title }),
    }),

  toggleTask: (taskId: string, completed: boolean) =>
    fetchJSON<{ task: any }>(`/rooms/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),

  // Files & Projects
  createFile: (projectId: string, name: string, path: string, language: string, content: string = '') =>
    fetchJSON<{ file: FileItem }>('/projects/files', {
      method: 'POST',
      body: JSON.stringify({ projectId, name, path, language, content }),
    }),

  updateFile: (fileId: string, content?: string, language?: string) =>
    fetchJSON<{ file: FileItem }>(`/projects/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify({ content, language }),
    }),

  deleteFile: (fileId: string) =>
    fetchJSON<{ success: boolean; fileId: string }>(`/projects/files/${fileId}`, {
      method: 'DELETE',
    }),

  renameFile: (fileId: string, name: string, path: string) =>
    fetchJSON<{ file: FileItem }>(`/projects/files/${fileId}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ name, path }),
    }),

  exportProject: (projectId: string) =>
    fetchJSON<{ project: Project; markdown: string }>(`/projects/${projectId}/export`),

  // AI Assistant
  processAI: (type: string, code: string, prompt?: string, language: string = 'javascript', roomId?: string) =>
    fetchJSON<AIResponse>('/ai/process', {
      method: 'POST',
      body: JSON.stringify({ type, code, prompt, language, roomId }),
    }),

  // Code Execution
  runCode: (code: string, language: string) =>
    fetchJSON<ExecutionResult>('/code/run', {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    }),

  // Challenges
  getChallenges: (difficulty?: string) =>
    fetchJSON<{ challenges: Challenge[] }>(`/challenges${difficulty ? `?difficulty=${difficulty}` : ''}`),

  getChallenge: (slug: string) => fetchJSON<{ challenge: Challenge }>(`/challenges/${slug}`),

  submitChallenge: (challengeId: string, code: string) =>
    fetchJSON<{
      status: string;
      submission: any;
      testResults: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
      executionTimeMs: number;
      stdout: string;
      stderr: string;
    }>('/challenges/submit', {
      method: 'POST',
      body: JSON.stringify({ challengeId, code }),
    }),

  getLeaderboard: () => fetchJSON<{ leaderboard: LeaderboardUser[] }>('/challenges/leaderboard'),
};
