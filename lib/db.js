import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db = null;

/**
 * Returns the singleton SQLite database connection.
 * Creates the DB file and tables if they don't exist yet.
 */
export function getDb() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'api_deportivo.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Ensure all tables exist (idempotent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      identification TEXT UNIQUE NOT NULL,
      paid INTEGER DEFAULT 0,
      cancelled INTEGER DEFAULT 0,
      cancellation_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 6),
      attended INTEGER DEFAULT 0,
      cancelled INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, week)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      weeks_attended INTEGER DEFAULT 0,
      final_grade INTEGER DEFAULT 0,
      cancelled INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id)
    );
  `);

  return db;
}

/**
 * Normalizes a SQLite row — converts 0/1 integers to booleans
 * for the fields that should be boolean.
 */
export function normalizeStudent(row) {
  if (!row) return null;
  return {
    ...row,
    paid: row.paid === 1,
    cancelled: row.cancelled === 1,
  };
}

export function normalizeAttendance(row) {
  if (!row) return null;
  return {
    ...row,
    attended: row.attended === 1,
    cancelled: row.cancelled === 1,
  };
}

export function normalizeGrade(row) {
  if (!row) return null;
  return {
    ...row,
    cancelled: row.cancelled === 1,
  };
}
