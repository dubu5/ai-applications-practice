import { GameSession } from '../quiz/types';

const SESSION_KEY = 'quiz_game_session';
const NICKNAME_KEY = 'quiz_player_nickname';

export function saveSession(session: GameSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession(): GameSession | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

export function saveNickname(nickname: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname);
  } catch (error) {
    console.error('Failed to save nickname:', error);
  }
}

export function loadNickname(): string | null {
  try {
    return localStorage.getItem(NICKNAME_KEY);
  } catch (error) {
    console.error('Failed to load nickname:', error);
    return null;
  }
}

export function hasActiveSession(): boolean {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session !== null;
  } catch (error) {
    return false;
  }
}
