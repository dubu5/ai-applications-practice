import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA_SQL } from './schema.js';

let db: Database.Database;

export function initDatabase(dbPath: string = './quiz.db'): Database.Database {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(SCHEMA_SQL);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
