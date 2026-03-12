-- ================================================================
-- IMS — Complete Database Schema (DDL)
-- ================================================================
-- Run this FIRST to create all tables, types, and indexes.
-- Usage: psql -U <user> -d <database> -f db/schema.sql
-- ================================================================

-- Clean slate
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Custom Types ──────────────────────────────────────────────
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('STUDENT', 'TUTOR', 'ADMIN', 'STAFF', 'NA');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('SALARY', 'FEES', 'INCOME', 'EXPENSE', 'OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fees_status') THEN
    CREATE TYPE fees_status AS ENUM('PAID', 'WAIVED_OFF', 'PENDING', 'OVERDUE');
  END IF;
END $$;

-- ── Core Entity Tables ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL DEFAULT 'NA',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "student" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  grade VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "tutor" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "staff" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  salary INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

-- ── Lookup Tables ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "subject" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE CHECK (name = UPPER(name)),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "grade" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "classroom" (
  id SERIAL PRIMARY KEY,
  capacity INT NOT NULL DEFAULT 10,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

-- ── Junction & Relationship Tables ────────────────────────────

CREATE TABLE IF NOT EXISTS "subject_tutor" (
  id SERIAL PRIMARY KEY,
  subjectid INTEGER REFERENCES subject(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  tutorid INTEGER REFERENCES tutor(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  gradeid INTEGER REFERENCES grade(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  fees INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "student_subject" (
  id SERIAL PRIMARY KEY,
  studentid INTEGER NOT NULL REFERENCES student(id) ON UPDATE CASCADE ON DELETE CASCADE,
  subjecttutorid INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── Operational Tables ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "timetable" (
  id SERIAL PRIMARY KEY,
  timeslot VARCHAR(255) NOT NULL,
  timeslotid VARCHAR(255) NOT NULL,
  classroomid INTEGER NOT NULL REFERENCES classroom(id) ON UPDATE CASCADE ON DELETE CASCADE,
  monday INT, tuesday INT, wednesday INT, thursday INT,
  friday INT, saturday INT, sunday INT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "chatroom" (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES student(id) ON UPDATE CASCADE ON DELETE CASCADE,
  message VARCHAR(2000) NOT NULL,
  subjecttutorid INT NOT NULL REFERENCES subject_tutor(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── Financial Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "transaction" (
  id SERIAL PRIMARY KEY,
  transaction_type transaction_type NOT NULL DEFAULT 'OTHER',
  amount INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL,
  participant_id INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "student_fees" (
  id SERIAL PRIMARY KEY,
  studentid INT NOT NULL REFERENCES student(id),
  month VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  totalamount FLOAT NOT NULL,
  status fees_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tutor_payments" (
  id SERIAL PRIMARY KEY,
  tutorid INT NOT NULL REFERENCES tutor(id),
  month INT NOT NULL,
  year INT NOT NULL,
  totalpayment DECIMAL(10,2) NOT NULL,
  received DECIMAL(10,2) NOT NULL,
  receiveddate DATE NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── Student Learning Tables ───────────────────────────────────

CREATE TABLE IF NOT EXISTS "notes" (
  id SERIAL PRIMARY KEY,
  studentid INT NOT NULL REFERENCES student(id),
  subjecttutorid INT NOT NULL REFERENCES subject_tutor(id),
  subject VARCHAR(255) NOT NULL,
  chapter VARCHAR(255) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'PENDING',
  points DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "goals" (
  id SERIAL PRIMARY KEY,
  studentid INT NOT NULL REFERENCES student(id),
  subjecttutorid INT,
  goaltitle VARCHAR(255) NOT NULL,
  targetdate DATE NOT NULL,
  progress FLOAT DEFAULT 0,
  streak INT DEFAULT 0,
  status VARCHAR(255) NOT NULL DEFAULT 'Active',
  lastprogressupdate DATE DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "flashcard" (
  id SERIAL PRIMARY KEY,
  studentid INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  noteid INTEGER REFERENCES notes(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty VARCHAR(10) DEFAULT 'MEDIUM',
  next_review DATE DEFAULT CURRENT_DATE,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "quiz_attempt" (
  id SERIAL PRIMARY KEY,
  studentid INTEGER NOT NULL REFERENCES student(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percent FLOAT NOT NULL,
  time_taken_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Trail ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "activity_log" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100),
  entity_id INTEGER,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── Performance Indexes ───────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_flashcard_studentid ON flashcard(studentid);
CREATE INDEX IF NOT EXISTS idx_flashcard_next_review ON flashcard(next_review);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_studentid ON quiz_attempt(studentid);
CREATE INDEX IF NOT EXISTS idx_notes_studentid ON notes(studentid);
CREATE INDEX IF NOT EXISTS idx_goals_studentid ON goals(studentid);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON "transaction"(transaction_type);
CREATE INDEX IF NOT EXISTS idx_student_fees_studentid ON student_fees(studentid);
CREATE INDEX IF NOT EXISTS idx_tutor_payments_tutorid ON tutor_payments(tutorid);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ================================================================
-- Schema creation complete. Run db/seed.sql next to populate data.
-- ================================================================

