-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- Supabase Dashboard → SQL Editor → New query → pegar y Run
-- ============================================================

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  email             TEXT DEFAULT '',
  identification    TEXT UNIQUE NOT NULL,
  paid              BOOLEAN DEFAULT FALSE,
  cancelled         BOOLEAN DEFAULT FALSE,
  cancellation_date DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistencia (6 semanas por estudiante)
CREATE TABLE IF NOT EXISTS attendance (
  id          BIGSERIAL PRIMARY KEY,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  week        INTEGER NOT NULL CHECK (week BETWEEN 1 AND 6),
  attended    BOOLEAN DEFAULT FALSE,
  cancelled   BOOLEAN DEFAULT FALSE,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, week)
);

-- Tabla de calificaciones (una por estudiante)
CREATE TABLE IF NOT EXISTS grades (
  id             BIGSERIAL PRIMARY KEY,
  student_id     BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  weeks_attended INTEGER DEFAULT 0,
  final_grade    INTEGER DEFAULT 0 CHECK (final_grade BETWEEN 0 AND 5),
  cancelled      BOOLEAN DEFAULT FALSE,
  notes          TEXT DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
