const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface SessionResponse {
  sessionId: string;
  questions: Array<{
    id: string;
    category: string;
    question: string;
    choices: string[];
    difficulty: string;
  }>;
}

export interface AnswerResponse {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  points: number;
  feedback: {
    totalCorrect: number;
    currentScore: number;
  };
}

export interface FinishResponse {
  success: boolean;
  totalScore: number;
  totalTime: number;
  categoryScores: Record<string, number>;
  rank: number;
  leaderboardId: string;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  totalScore: number;
  totalTime: number;
  categoryScores: Record<string, number>;
  createdAt: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  timestamp: string;
}

export interface MyRankResponse {
  myEntry: LeaderboardEntry;
  aroundMe: LeaderboardEntry[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async createSession(nickname: string): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create session');
    }

    return response.json();
  }

  async getSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  }

  async submitAnswer(
    sessionId: string,
    questionId: string,
    answerIndex: number,
    timeSpent: number
  ): Promise<AnswerResponse> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        answerIndex,
        timeSpent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit answer');
    }

    return response.json();
  }

  async finishGame(sessionId: string): Promise<FinishResponse> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to finish game');
    }

    return response.json();
  }

  async getLeaderboard(limit: number = 100): Promise<LeaderboardResponse> {
    const response = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to get leaderboard');
    }

    return response.json();
  }

  async getMyRank(sessionId: string): Promise<MyRankResponse> {
    const response = await fetch(`${this.baseUrl}/leaderboard/me?sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get my rank');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
