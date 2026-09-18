export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  streakCount: number;
  leetcodeHandle?: string | null;
  codeforcesHandle?: string | null;
  codechefHandle?: string | null;
  gfgHandle?: string | null;
  bio?: string | null;
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
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  message: string;
  type: 'chat' | 'system' | 'code';
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Room {
  id: string;
  name: string;
  roomCode: string;
  description?: string;
  language: string;
  isPublic: boolean;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  members?: RoomMember[];
  projects?: Project[];
  tasks?: RoomTask[];
  messages?: ChatMessage[];
  createdAt?: string;
}

export interface AIResponse {
  id: string;
  type: string;
  input: string;
  output: string;
  fixedCode?: string;
  createdAt: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  error?: string;
  languageUsed?: string;
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
  testCases: string;
  hints: string;
  points: number;
  _count?: {
    submissions: number;
  };
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR';
  executionTime?: number;
  createdAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  streakCount: number;
  _count?: {
    submissions: number;
  };
}

export interface ContestProblem {
  id: string;
  contestId: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  points: number;
  order: number;
  description: string;
  starterCode: string;
  testCases: string;
  hints?: string;
}

export interface Contest {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isPublic: boolean;
  antiCheatEnabled: boolean;
  maxStrikes: number;
  createdById: string;
  problems?: ContestProblem[];
  _count?: {
    problems: number;
    participants: number;
    submissions?: number;
  };
}

export interface ContestParticipant {
  id: string;
  contestId: string;
  userId: string;
  score: number;
  totalTimeMs: number;
  strikes: number;
  isDisqualified: boolean;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface LeetCodeStats {
  handle: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
}

export interface CodeforcesStats {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
  friendOfCount: number;
  avatar: string;
}

export interface CodeChefStats {
  handle: string;
  rating: number;
  stars: string;
  globalRank: number;
  countryRank: number;
  problemsSolved: number;
}

export interface GFGStats {
  handle: string;
  codingScore: number;
  totalSolved: number;
  monthlyScore: number;
  instituteRank?: number;
}

export interface CombinedProfileStats {
  leetcode: LeetCodeStats | null;
  codeforces: CodeforcesStats | null;
  codechef: CodeChefStats | null;
  gfg: GFGStats | null;
}
