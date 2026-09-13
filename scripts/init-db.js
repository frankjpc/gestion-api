import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

function initializeDatabase() {
  try {
    // Crear directorio data si no existe
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'api_deportivo.db');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    console.log('Creating tables...');

    // Create students table
    db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        identification TEXT UNIQUE NOT NULL,
        paid INTEGER DEFAULT 0,
        cancelled INTEGER DEFAULT 0,
        cancellation_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Students table created');

    // Create attendance table
    db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 6),
        attended INTEGER DEFAULT 0,
        cancelled INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(student_id, week)
      )
    `);
    console.log('✓ Attendance table created');

    // Create grades table
    db.exec(`
      CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        weeks_attended INTEGER DEFAULT 0,
        final_grade INTEGER DEFAULT 0 CHECK (final_grade BETWEEN 0 AND 5),
        cancelled INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(student_id)
      )
    `);
    console.log('✓ Grades table created');

    db.close();
    console.log('✓ Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
