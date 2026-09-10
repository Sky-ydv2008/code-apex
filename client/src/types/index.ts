export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  streakCount: number;
  createdAt?: string;
}

export interface RoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface FileItem {
  id: string;
  projectId: string;
  name: string;
  path: string;
  content: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  files: FileItem[];
}

export interface RoomTask {
  id: string;
  roomId: string;
  title: string;
  completed: boolean;
  createdBy?: { id: string; name: string };
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  type: 'chat' | 'system' | 'code';
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  roomCode: string;
  description?: string;
  language: string;
  isPublic: boolean;
  ownerId: string;
  owner?: { id: string; name: string; avatar?: string };
  members: RoomMember[];
  projects: Project[];
  tasks?: RoomTask[];
  messages?: ChatMessage[];
  _count?: { members: number };
}

export interface AIResponse {
  type: string;
  result: string;
  fixedCode?: string;
  score?: number;
  breakdown?: {
    readability: number;
    correctness: number;
    performance: number;
    maintainability: number;
  };
  hints?: string[];
  testCases?: Array<{ input: string; expectedOutput: string; explanation: string }>;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  error?: string;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  description: string;
  starterCode: string;
  language: string;
  testCases?: Array<{ input: string; expected: string }>;
  hints?: string[];
  points: number;
  _count?: { submissions: number };
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'TIME_LIMIT_EXCEEDED';
  executionTime?: number;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  streakCount: number;
  _count: { submissions: number };
}
