-- ================================================================
-- IMS — Expanded Comprehensive Seed Data
-- ================================================================
-- This script resets all tables and inserts a robust set of test data.
-- ================================================================

-- 1. Cleanup
TRUNCATE TABLE 
    "user", 
    "admin", 
    "staff", 
    "tutor", 
    "student", 
    "subject", 
    "grade", 
    "classroom", 
    "subject_tutor", 
    "student_subject", 
    "timetable", 
    "chatroom", 
    "notes", 
    "goals", 
    "flashcard", 
    "quiz_attempt", 
    "student_fees", 
    "tutor_payments", 
    "transaction", 
    "activity_log"
RESTART IDENTITY CASCADE;

-- 2. Create Users (Centralized Auth)
-- Passwords: admin123, staff123, tutor123, student123 (hashed)
INSERT INTO "user" (id, username, email, password, user_type, is_active) VALUES
-- Admins
(1, 'admin', 'admin@ims.com', '$2a$10$GH8UbpNbGY63pnOin5QADOG9Ho61czLTzqkNR9e.Chu1wPcNwS216', 'ADMIN', true),
(2, 'admin2', 'admin2@ims.com', '$2a$10$GH8UbpNbGY63pnOin5QADOG9Ho61czLTzqkNR9e.Chu1wPcNwS216', 'ADMIN', true),
-- Staff
(3, 'staff1', 'staff1@ims.com', '$2a$10$pqBGXDv8aSD0gBzaO1RADeK06rC1Bq.lg6rEly.j5kXuCqjf38Lmq', 'STAFF', true),
(4, 'staff2', 'staff2@ims.com', '$2a$10$pqBGXDv8aSD0gBzaO1RADeK06rC1Bq.lg6rEly.j5kXuCqjf38Lmq', 'STAFF', true),
-- Tutors
(5, 'tutor1', 'tutor1@ims.com', '$2a$10$k7uhyMgI25HQ1Rif03EMnukDDHb.vg4SWkaK5PK97ejLLFMM1tG3O', 'TUTOR', true),
(6, 'tutor2', 'tutor2@ims.com', '$2a$10$k7uhyMgI25HQ1Rif03EMnukDDHb.vg4SWkaK5PK97ejLLFMM1tG3O', 'TUTOR', true),
(7, 'tutor3', 'tutor3@ims.com', '$2a$10$k7uhyMgI25HQ1Rif03EMnukDDHb.vg4SWkaK5PK97ejLLFMM1tG3O', 'TUTOR', true),
-- Students
(8, 'student1', 'student1@ims.com', '$2a$10$amd2BSJpV6H3bGVNZcVsHe0J/96Y/moupWYcRTFu3Y40Tt.e632H6', 'STUDENT', true),
(9, 'student2', 'student2@ims.com', '$2a$10$amd2BSJpV6H3bGVNZcVsHe0J/96Y/moupWYcRTFu3Y40Tt.e632H6', 'STUDENT', true),
(10, 'student3', 'student3@ims.com', '$2a$10$amd2BSJpV6H3bGVNZcVsHe0J/96Y/moupWYcRTFu3Y40Tt.e632H6', 'STUDENT', true),
(11, 'student4', 'student4@ims.com', '$2a$10$amd2BSJpV6H3bGVNZcVsHe0J/96Y/moupWYcRTFu3Y40Tt.e632H6', 'STUDENT', true),
(12, 'student5', 'student5@ims.com', '$2a$10$amd2BSJpV6H3bGVNZcVsHe0J/96Y/moupWYcRTFu3Y40Tt.e632H6', 'STUDENT', true);

-- 3. Create Profiles
INSERT INTO "admin" (id, user_id, firstname, lastname, contact) VALUES
(1, 1, 'Main', 'Admin', '0112345678'),
(2, 2, 'Secondary', 'Admin', '0119876543');

INSERT INTO "staff" (id, user_id, title, firstname, lastname, position, contact, salary) VALUES
(1, 3, 'Mr.', 'Mark', 'Stafford', 'Registrar', '0771112223', 60000),
(2, 4, 'Ms.', 'Sarah', 'Jenkins', 'Coordinator', '0772223334', 55000);

INSERT INTO "tutor" (id, user_id, title, firstname, lastname, contact) VALUES
(1, 5, 'Mr.', 'Robert', 'Tutor', '0773334445'),
(2, 6, 'Dr.', 'Emily', 'Stone', '0774445556'),
(3, 7, 'Mrs.', 'Susan', 'Miller', '0775556667');

INSERT INTO "student" (id, user_id, firstname, lastname, contact, grade) VALUES
(1, 8, 'John', 'Student', '0775556667', 'Grade 10'),
(2, 9, 'Jane', 'Doe', '0778889990', 'Grade 11'),
(3, 10, 'Michael', 'Johnson', '0771110000', 'Grade 12'),
(4, 11, 'Emily', 'Davis', '0772221111', 'Grade 10'),
(5, 12, 'William', 'Wilson', '0773332222', 'Grade 13');

-- 4. Lookup Data
INSERT INTO "subject" (id, name) VALUES 
(1, 'MATHEMATICS'), 
(2, 'PHYSICS'), 
(3, 'CHEMISTRY'), 
(4, 'BIOLOGY'), 
(5, 'COMBINED MATHS'),
(6, 'ENGLISH'),
(7, 'ICT');

INSERT INTO "grade" (id, name) VALUES 
(1, 'Grade 10'), 
(2, 'Grade 11'), 
(3, 'Grade 12'), 
(4, 'Grade 13');

INSERT INTO "classroom" (id, name, capacity) VALUES 
(1, 'Hall A', 100), 
(2, 'Room 101', 30), 
(3, 'Room 102', 30),
(4, 'Lab 1', 25);

-- 5. Mappings (Subject-Tutor) - Multi-tutor multi-subject
INSERT INTO "subject_tutor" (id, subjectid, tutorid, gradeid, fees) VALUES
(1, 1, 1, 1, 2500), -- Math, Tutor1, Grade 10
(2, 2, 1, 2, 3000), -- Physics, Tutor1, Grade 11
(3, 3, 2, 2, 2800), -- Chemistry, Tutor2, Grade 11
(4, 4, 3, 3, 3500), -- Biology, Tutor3, Grade 12
(5, 7, 2, 1, 2200), -- ICT, Tutor2, Grade 10
(6, 5, 1, 3, 4000); -- Combined Maths, Tutor1, Grade 12

-- 6. Allocations (Student-Subject) - Multi-student enrolment
INSERT INTO "student_subject" (id, studentid, subjecttutorid, is_active) VALUES
(1, 1, 1, true), -- John in Math (ST 1)
(2, 1, 5, true), -- John in ICT (ST 5)
(3, 2, 2, true), -- Jane in Physics (ST 2)
(4, 2, 3, true), -- Jane in Chemistry (ST 3)
(5, 3, 4, true), -- Michael in Biology (ST 4)
(6, 3, 2, true), -- Michael in Physics (ST 2)
(7, 4, 1, true), -- Emily in Math (ST 1)
(8, 4, 5, true), -- Emily in ICT (ST 5)
(9, 5, 2, true), -- William in Physics (ST 2)
(10, 5, 6, true); -- William in Combined Maths (ST 6)

-- 7. Timetable - Full Week Schedule
INSERT INTO "timetable" (id, classroomid, timeslot, timeslotid, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES
(1, 1, '08:00 - 10:00', 'T1', 1, NULL, 1, NULL, 4, 4, NULL), -- Math (ST 1) Mon/Wed, Bio Sat/Sun
(2, 2, '10:30 - 12:30', 'T2', NULL, 2, NULL, 2, NULL, NULL, 2), -- Physics (ST 2) Tue/Thu/Sun
(3, 3, '13:30 - 15:30', 'T3', 3, NULL, 3, NULL, 3, NULL, NULL), -- Chemistry (ST 3) Mon/Wed/Fri
(4, 4, '16:00 - 18:00', 'T4', NULL, 5, NULL, 5, NULL, 5, NULL), -- ICT (ST 5) Tue/Thu/Sat
(5, 1, '18:30 - 20:30', 'T5', 6, 6, 6, 6, 6, NULL, NULL); -- Combined Maths (ST 6) Weekdays

-- 8. Activity & Learning Data (Bulk Data)
-- Notes for multiple students
INSERT INTO "notes" (id, studentid, subjecttutorid, subject, chapter, heading, note, status, points) VALUES
(1, 1, 1, 'MATHEMATICS', 'Algebra', 'Quadratic Equations', 'Standard form: ax^2 + bx + c = 0. Roots are given by formula...', 'APPROVED', 10),
(2, 1, 5, 'ICT', 'Programming', 'Python Basics', 'Python is an interpreted, high-level, general-purpose programming language.', 'APPROVED', 15),
(3, 2, 2, 'PHYSICS', 'Mechanics', 'Newtons Laws', '1. Law of Inertia. 2. F=ma. 3. Action = Reaction.', 'APPROVED', 12),
(4, 3, 4, 'BIOLOGY', 'Genetics', 'Mendelian Genetics', 'Gregor Mendel discovered the fundamental laws of inheritance.', 'PENDING', 0);

-- Goals for students
INSERT INTO "goals" (id, studentid, goaltitle, targetdate, lastprogressupdate, progress) VALUES
(1, 1, 'Master Algebra', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE, 45),
(2, 2, 'Prepare for Physics Quiz', CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE, 80),
(3, 3, 'Complete Biology Project', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE, 20),
(4, 4, 'Learn Python Basics', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE, 10);

-- Flashcards
INSERT INTO "flashcard" (id, studentid, noteid, subject, front, back, difficulty, next_review) VALUES
(1, 1, 1, 'MATHEMATICS', 'Quadratic Formula', 'x = (-b ± √(b^2 - 4ac)) / 2a', 'MEDIUM', CURRENT_DATE),
(2, 2, 3, 'PHYSICS', 'F = ma', 'Force = Mass x Acceleration', 'EASY', CURRENT_DATE + INTERVAL '1 day'),
(3, 1, 2, 'ICT', 'What is Python?', 'High-level programming language', 'EASY', CURRENT_DATE);

-- Quiz Attempts
INSERT INTO "quiz_attempt" (id, studentid, subject, total_questions, correct_answers, score_percent) VALUES
(1, 1, 'MATHEMATICS', 10, 8, 80),
(2, 2, 'PHYSICS', 15, 12, 80),
(3, 3, 'BIOLOGY', 20, 18, 90),
(4, 1, 'ICT', 10, 10, 100);

-- 9. Financial Data (Bulk Payments & Fees)
-- Tutor Payments
INSERT INTO "tutor_payments" (id, tutorid, month, year, totalpayment, received, receiveddate) VALUES
(1, 1, 3, 2026, 15000, 15000, CURRENT_DATE - INTERVAL '5 days'),
(2, 2, 3, 2026, 8000, 0, NULL),
(3, 3, 3, 2026, 12000, 12000, CURRENT_DATE - INTERVAL '2 days');

-- Student Fees
INSERT INTO "student_fees" (id, studentid, month, year, amount, status) VALUES
(1, 1, 'March', 2026, 4700, 'PAID'),
(2, 2, 'March', 2026, 5800, 'PAID'),
(3, 3, 'March', 2026, 6500, 'PENDING'),
(4, 4, 'March', 2026, 4700, 'PAID'),
(5, 5, 'March', 2026, 7000, 'OVERDUE');

-- 10. Fix sequences to start after manual IDs
SELECT setval('user_id_seq', (SELECT MAX(id) FROM "user"));
SELECT setval('admin_id_seq', (SELECT MAX(id) FROM "admin"));
SELECT setval('staff_id_seq', (SELECT MAX(id) FROM "staff"));
SELECT setval('tutor_id_seq', (SELECT MAX(id) FROM "tutor"));
SELECT setval('student_id_seq', (SELECT MAX(id) FROM "student"));
SELECT setval('subject_id_seq', (SELECT MAX(id) FROM "subject"));
SELECT setval('grade_id_seq', (SELECT MAX(id) FROM "grade"));
SELECT setval('classroom_id_seq', (SELECT MAX(id) FROM "classroom"));
SELECT setval('subject_tutor_id_seq', (SELECT MAX(id) FROM "subject_tutor"));
SELECT setval('student_subject_id_seq', (SELECT MAX(id) FROM "student_subject"));
SELECT setval('timetable_id_seq', (SELECT MAX(id) FROM "timetable"));
SELECT setval('notes_id_seq', (SELECT MAX(id) FROM "notes"));
SELECT setval('goals_id_seq', (SELECT MAX(id) FROM "goals"));
SELECT setval('flashcard_id_seq', (SELECT MAX(id) FROM "flashcard"));
SELECT setval('quiz_attempt_id_seq', (SELECT MAX(id) FROM "quiz_attempt"));
SELECT setval('tutor_payments_id_seq', (SELECT MAX(id) FROM "tutor_payments"));
SELECT setval('student_fees_id_seq', (SELECT MAX(id) FROM "student_fees"));
