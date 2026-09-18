import {
  User,
  Room,
  Project,
  FileItem,
  AIResponse,
  ExecutionResult,
  Challenge,
  LeaderboardUser,
  Contest,
  ContestParticipant,
  CombinedProfileStats,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('codecraft_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data;
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
    fetchJSON<{ task: unknown }>('/rooms/tasks', {
      method: 'POST',
      body: JSON.stringify({ roomId, title }),
    }),

  toggleTask: (taskId: string, completed: boolean) =>
    fetchJSON<{ task: unknown }>(`/rooms/tasks/${taskId}`, {
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
  runCode: (code: string, language: string, stdinInput: string = '') =>
    fetchJSON<ExecutionResult>('/code/run', {
      method: 'POST',
      body: JSON.stringify({ code, language, stdinInput }),
    }),

  // Challenges
  getChallenges: (difficulty?: string) =>
    fetchJSON<{ challenges: Challenge[] }>(`/challenges${difficulty ? `?difficulty=${difficulty}` : ''}`),

  getChallenge: (slug: string) => fetchJSON<{ challenge: Challenge }>(`/challenges/${slug}`),

  submitChallenge: (challengeId: string, code: string) =>
    fetchJSON<{
      submission: unknown;
      isPassed: boolean;
      passCount: number;
      totalCount: number;
    }>('/challenges/submit', {
      method: 'POST',
      body: JSON.stringify({ challengeId, code }),
    }),

  getLeaderboard: () => fetchJSON<{ leaderboard: LeaderboardUser[] }>('/challenges/leaderboard'),

  // Contests
  getContests: () => fetchJSON<{ contests: Contest[] }>('/contests'),

  getContest: (idOrSlug: string) =>
    fetchJSON<{ contest: Contest; participant: ContestParticipant | null }>(`/contests/${idOrSlug}`),

  createContest: (payload: {
    title: string;
    description: string;
    rules?: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    antiCheatEnabled?: boolean;
    maxStrikes?: number;
  }) =>
    fetchJSON<{ contest: Contest }>('/contests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinContest: (contestId: string) =>
    fetchJSON<{ participant: ContestParticipant }>(`/contests/${contestId}/join`, {
      method: 'POST',
    }),

  submitContestProblem: (contestId: string, problemId: string, code: string, language: string) =>
    fetchJSON<{
      submission: unknown;
      isPassed: boolean;
      passCount: number;
      totalCount: number;
      status: string;
      score: number;
    }>(`/contests/${contestId}/problems/${problemId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    }),

  logContestAntiCheat: (contestId: string, eventType: string, details?: string) =>
    fetchJSON<{
      strikes: number;
      maxStrikes: number;
      isDisqualified: boolean;
      warningMessage: string;
    }>(`/contests/${contestId}/anti-cheat`, {
      method: 'POST',
      body: JSON.stringify({ eventType, details }),
    }),

  getContestLeaderboard: (contestId: string) =>
    fetchJSON<{ leaderboard: Array<unknown> }>(`/contests/${contestId}/leaderboard`),

  // External Platform Profiles
  getMyExternalProfile: () =>
    fetchJSON<{
      handles: User;
      stats: CombinedProfileStats;
    }>('/external-profile/me'),

  getUserExternalProfile: (userId: string) =>
    fetchJSON<{
      handles: User;
      stats: CombinedProfileStats;
    }>(`/external-profile/user/${userId}`),

  updateExternalHandles: (payload: {
    leetcodeHandle?: string;
    codeforcesHandle?: string;
    codechefHandle?: string;
    gfgHandle?: string;
    bio?: string;
  }) =>
    fetchJSON<{
      user: User;
      stats: CombinedProfileStats;
    }>('/external-profile/handles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
