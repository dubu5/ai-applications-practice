import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL } from '../src/db/schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../quiz.db');
const QUESTIONS_PATH = resolve(__dirname, '../../web/src/data/questions.json');

interface Question {
  id: string;
  category: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  difficulty: string;
  source: string;
  active: boolean;
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Initialize database
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  try {
    // Create tables
    console.log('📋 Creating tables...');
    db.exec(SCHEMA_SQL);

    // Read questions from JSON
    console.log('📖 Reading questions from JSON...');
    const questionsData = readFileSync(QUESTIONS_PATH, 'utf-8');
    const questions: Question[] = JSON.parse(questionsData);

    // Insert questions
    console.log(`✏️  Inserting ${questions.length} questions...`);
    const insertQuestion = db.prepare(`
      INSERT OR REPLACE INTO questions
      (id, category, question, choices, answerIndex, explanation, difficulty, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const q of questions) {
      insertQuestion.run(
        q.id,
        q.category,
        q.question,
        JSON.stringify(q.choices),
        q.answerIndex,
        q.explanation,
        q.difficulty,
        q.source || 'General'
      );
    }

    console.log(`✅ Database seeded successfully!`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Database: ${DB_PATH}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

seed();
