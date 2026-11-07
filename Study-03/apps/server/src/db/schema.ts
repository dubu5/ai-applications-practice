export interface Question {
  id: string;
  category: 'history' | 'science' | 'geography' | 'general';
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  created_at: string;
}

export interface Session {
  id: string;
  nickname: string;
  status: 'active' | 'completed';
  total_score: number;
  total_time: number;
  category_scores: Record<string, number> | null;
  question_ids: string[];
  created_at: string;
  completed_at: string | null;
}

export interface SessionAnswer {
  id: number;
  session_id: string;
  question_id: string;
  answer_index: number;
  time_spent: number;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface LeaderboardEntry {
  id: string;
  session_id: string;
  nickname: string;
  total_score: number;
  total_time: number;
  category_scores: Record<string, number> | null;
  rank?: number;
  created_at: string;
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('history', 'science', 'geography', 'general')),
  question TEXT NOT NULL,
  choices TEXT NOT NULL, -- JSON
  answerIndex INTEGER NOT NULL CHECK (answerIndex >= 0 AND answerIndex <= 3),
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  total_score INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  category_scores TEXT, -- JSON
  question_ids TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS session_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_index INTEGER NOT NULL CHECK (answer_index >= 0 AND answer_index <= 3),
  time_spent INTEGER NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE (session_id, question_id)
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  category_scores TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
ON leaderboard (total_score DESC, total_time ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_session_answers_session
ON session_answers (session_id);
`;
