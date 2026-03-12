-- ================================================================
-- IMS — Complete Seed Data (DML)
-- ================================================================
-- Run this AFTER db/schema.sql to populate all tables.
-- Usage: psql -U <user> -d <database> -f db/seed.sql
-- ================================================================
-- All passwords: password123
-- Admin login:   admin@ims.com / password123
-- Student login: student1@ims.com / password123
-- Tutor login:   tutor1@ims.com / password123
-- Staff login:   staff1@ims.com / password123
-- ================================================================

DO $$ 
DECLARE 
    pass_hash TEXT := '$2a$10$6nZ3xObQI0.qrVxS.oirieLdypoRrHkzt7wyhJe1gxzJ30rCw47GW';
    tutor_count INT := 30;
    staff_count INT := 40;
    student_count INT := 500;
    i INT;
    j INT;
    t_id INT;
    st_id INT;
    note_id INT;
BEGIN
    -- ── 1. CLEANUP ─────────────────────────────────────────
    TRUNCATE TABLE "user", "student", "tutor", "staff", "grade", "subject", "classroom", 
                   "subject_tutor", "student_subject", "transaction", "tutor_payments", 
                   "student_fees", "timetable", "notes", "goals", "chatroom",
                   "flashcard", "quiz_attempt"
    RESTART IDENTITY CASCADE;

    -- ── 2. LOOKUP DATA ─────────────────────────────────────

    INSERT INTO "grade" (name, created_at, updated_at) VALUES
    ('Grade 6', NOW(), NOW()), ('Grade 7', NOW(), NOW()), ('Grade 8', NOW(), NOW()), 
    ('Grade 9', NOW(), NOW()), ('Grade 10', NOW(), NOW()), ('Grade 11', NOW(), NOW()),
    ('AL Mathematics', NOW(), NOW()), ('AL Science', NOW(), NOW()), ('AL Commerce', NOW(), NOW()),
    ('AL Arts', NOW(), NOW()), ('Pre-Grade', NOW(), NOW());

    INSERT INTO "subject" (name, created_at, updated_at) VALUES
    ('MATHEMATICS', NOW(), NOW()), ('ENGLISH', NOW(), NOW()), ('SCIENCE', NOW(), NOW()), 
    ('HISTORY', NOW(), NOW()), ('ICT', NOW(), NOW()), ('PHYSICS', NOW(), NOW()), 
    ('CHEMISTRY', NOW(), NOW()), ('BIOLOGY', NOW(), NOW()), ('COMMERCE', NOW(), NOW()),
    ('ACCOUNTING', NOW(), NOW()), ('ECONOMICS', NOW(), NOW()), ('ART', NOW(), NOW()),
    ('GEOGRAPHY', NOW(), NOW()), ('SOCIOLOGY', NOW(), NOW()), ('PSYCHOLOGY', NOW(), NOW()),
    ('FRENCH', NOW(), NOW()), ('TAMIL', NOW(), NOW()), ('SINHALA', NOW(), NOW());

    INSERT INTO "classroom" (name, capacity, created_at, updated_at) VALUES
    ('Main Hall A', 200, NOW(), NOW()), ('Main Hall B', 200, NOW(), NOW()),
    ('Smart Lab 1', 50, NOW(), NOW()), ('Smart Lab 2', 50, NOW(), NOW()), 
    ('Room 101', 40, NOW(), NOW()), ('Room 102', 40, NOW(), NOW()),
    ('Seminar Room', 80, NOW(), NOW()), ('Auditorium', 500, NOW(), NOW()), 
    ('Zoom Room 1', 2000, NOW(), NOW()), ('Zoom Room 2', 2000, NOW(), NOW());

    -- ── 3. USERS & PROFILES ────────────────────────────────

    -- Admin
    INSERT INTO "user" (username, email, password, user_type, is_active, created_at, updated_at)
    VALUES ('admin', 'admin@ims.com', pass_hash, 'ADMIN'::user_type, true, NOW(), NOW());

    -- Tutors
    FOR i IN 1..tutor_count LOOP
        INSERT INTO "user" (username, email, password, user_type, is_active, created_at, updated_at)
        VALUES ('tutor'||i, 'tutor'||i||'@ims.com', pass_hash, 'TUTOR'::user_type, true, NOW(), NOW()) RETURNING id INTO t_id;
        INSERT INTO "tutor" (user_id, username, email, password, title, firstname, lastname, contact, created_at, updated_at)
        VALUES (t_id, 'tutor'||i, 'tutor'||i||'@ims.com', pass_hash, 
               CASE WHEN i%2=0 THEN 'Mr.' ELSE 'Dr.' END, 
               'Tutor_'||i, 'LastName_'||i, '077'||(1000000+i), NOW(), NOW());
    END LOOP;

    -- Staff
    FOR i IN 1..staff_count LOOP
        INSERT INTO "user" (username, email, password, user_type, is_active, created_at, updated_at)
        VALUES ('staff'||i, 'staff'||i||'@ims.com', pass_hash, 'STAFF'::user_type, true, NOW(), NOW()) RETURNING id INTO t_id;
        INSERT INTO "staff" (user_id, username, email, password, title, firstname, lastname, contact, position, salary, created_at, updated_at)
        VALUES (t_id, 'staff'||i, 'staff'||i||'@ims.com', pass_hash, 'Ms.', 'Staff_'||i, 'LN_'||i, '011'||(2000000+i), 
               CASE WHEN i%4=0 THEN 'Manager' WHEN i%4=1 THEN 'Coordinator' ELSE 'Clerk' END, 
               40000 + (i*1000), NOW(), NOW());
    END LOOP;

    -- Students
    FOR i IN 1..student_count LOOP
        INSERT INTO "user" (username, email, password, user_type, is_active, created_at, updated_at)
        VALUES ('student'||i, 'student'||i||'@ims.com', pass_hash, 'STUDENT'::user_type, true, NOW(), NOW()) RETURNING id INTO t_id;
        INSERT INTO "student" (user_id, username, email, password, firstname, lastname, contact, grade, created_at, updated_at)
        VALUES (t_id, 'student'||i, 'student'||i||'@ims.com', pass_hash, 'Student_FN_'||i, 'Student_LN_'||i, '071'||(3000000+i), 
               CASE WHEN i%5=0 THEN 'Grade 11' WHEN i%5=1 THEN 'Grade 10' ELSE 'Grade 9' END, NOW(), NOW());
    END LOOP;

    -- ── 4. SUBJECT ALLOCATIONS ─────────────────────────────

    FOR i IN 1..55 LOOP
        INSERT INTO "subject_tutor" (tutorid, subjectid, gradeid, fees, created_at, updated_at) 
        VALUES (
            (i%tutor_count)+1, 
            (i%18)+1, 
            (i%11)+1, 
            2000 + (i*50),
            NOW(), NOW()
        );
    END LOOP;

    -- ── 5. ENROLLMENTS ─────────────────────────────────────

    FOR i IN 1..student_count LOOP
        FOR j IN 1..(2 + (i%4)) LOOP
            INSERT INTO "student_subject" (studentid, subjecttutorid, is_active, created_at, updated_at)
            VALUES (i, ((i+j)%55)+1, true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- ── 6. FINANCIAL TRANSACTIONS ──────────────────────────

    -- Student Fees (12 months)
    FOR i IN 1..student_count LOOP
        FOR j IN 0..11 LOOP
            INSERT INTO "transaction" (transaction_type, amount, description, user_id, participant_id, created_at, updated_at)
            VALUES ('FEES'::transaction_type, 2000 + (random()*2000)::int, 'Student Monthly Fee - M'||(12-j), 1, i, NOW() - (j * interval '1 month') - (random() * interval '25 days'), NOW());
        END LOOP;
    END LOOP;

    -- Staff Salaries (12 months)
    FOR i IN 1..staff_count LOOP
        FOR j IN 0..11 LOOP
            INSERT INTO "transaction" (transaction_type, amount, description, user_id, participant_id, created_at, updated_at)
            VALUES ('SALARY'::transaction_type, 40000 + (i*500), 'Staff Salary Disbursement - M'||(12-j), 1, i, NOW() - (j * interval '1 month') - interval '2 days', NOW());
        END LOOP;
    END LOOP;

    -- Misc Expenses & Income
    FOR i IN 1..100 LOOP
        INSERT INTO "transaction" (transaction_type, amount, description, user_id, created_at, updated_at)
        VALUES (
            CASE WHEN i%3=0 THEN 'EXPENSE'::transaction_type ELSE 'INCOME'::transaction_type END,
            (random()*10000)::int,
            CASE WHEN i%3=0 THEN 'Infrastructure Repair '||i ELSE 'Corporate Grant '||i END,
            1, NOW() - (i * interval '2 days'), NOW()
        );
    END LOOP;

    -- ── 7. TUTOR SETTLEMENTS ───────────────────────────────

    FOR i IN 1..tutor_count LOOP
        FOR j IN 1..12 LOOP
            INSERT INTO "tutor_payments" (tutorid, month, year, totalpayment, received, receiveddate, created_at, updated_at)
            VALUES (i, j, 2025, 80000 + (random()*40000)::int, 
                   80000 + (random()*40000)::int,
                   NOW() - (j * interval '1 month'), NOW(), NOW());
        END LOOP;
    END LOOP;

    -- ── 8. STUDENT LEARNING DATA ───────────────────────────

    -- Notes for first 50 students (variety of subjects and statuses)
    FOR i IN 1..50 LOOP
        INSERT INTO "notes" (studentid, subjecttutorid, subject, chapter, heading, note, status, points, created_at, updated_at)
        VALUES (
            i, ((i)%55)+1,
            CASE WHEN i%6=0 THEN 'MATHEMATICS' WHEN i%6=1 THEN 'PHYSICS' WHEN i%6=2 THEN 'CHEMISTRY' 
                 WHEN i%6=3 THEN 'BIOLOGY' WHEN i%6=4 THEN 'ENGLISH' ELSE 'SCIENCE' END,
            'Chapter '||(i%10+1),
            'Key Concepts Part '||i,
            'This note covers important concepts about the fundamentals of the subject including core principles definitions formulas and practical applications that are essential for understanding the topic thoroughly and performing well in examinations',
            CASE WHEN i%3=0 THEN 'APPROVED' WHEN i%3=1 THEN 'PENDING' ELSE 'APPROVED' END,
            CASE WHEN i%3=0 THEN 10 WHEN i%3=2 THEN 15 ELSE 0 END,
            NOW() - (i * interval '1 day'), NOW()
        ) RETURNING id INTO note_id;

        -- Generate flashcards for approved notes
        IF i%3 != 1 THEN
            INSERT INTO "flashcard" (studentid, noteid, subject, front, back, difficulty, next_review, created_at, updated_at)
            VALUES (
                i, note_id,
                CASE WHEN i%6=0 THEN 'MATHEMATICS' WHEN i%6=1 THEN 'PHYSICS' WHEN i%6=2 THEN 'CHEMISTRY' 
                     WHEN i%6=3 THEN 'BIOLOGY' WHEN i%6=4 THEN 'ENGLISH' ELSE 'SCIENCE' END,
                'What are the core principles of Chapter '||(i%10+1)||'?',
                'The core principles include fundamental definitions formulas and practical applications covered in Chapter '||(i%10+1),
                CASE WHEN i%3=0 THEN 'EASY' ELSE 'MEDIUM' END,
                CURRENT_DATE + (i%7),
                NOW(), NOW()
            );
        END IF;
    END LOOP;

    -- Goals for first 30 students
    FOR i IN 1..30 LOOP
        INSERT INTO "goals" (studentid, goaltitle, targetdate, progress, streak, status, lastprogressupdate, created_at, updated_at)
        VALUES (
            i,
            CASE WHEN i%4=0 THEN 'Complete Chapter Revision' WHEN i%4=1 THEN 'Practice 50 Problems' 
                 WHEN i%4=2 THEN 'Read Reference Material' ELSE 'Write Summary Notes' END,
            CURRENT_DATE + (i * 3),
            CASE WHEN i%5=0 THEN 100 ELSE (i*3)%100 END,
            i%10,
            CASE WHEN i%5=0 THEN 'Completed' ELSE 'Active' END,
            CURRENT_DATE - (i%5),
            NOW() - (i * interval '2 days'), NOW()
        );
    END LOOP;

    -- Quiz attempts for first 20 students
    FOR i IN 1..20 LOOP
        FOR j IN 1..3 LOOP
            INSERT INTO "quiz_attempt" (studentid, subject, total_questions, correct_answers, score_percent, time_taken_seconds, created_at, updated_at)
            VALUES (
                i,
                CASE WHEN j=1 THEN 'MATHEMATICS' WHEN j=2 THEN 'PHYSICS' ELSE 'CHEMISTRY' END,
                10, (5 + (random()*5))::int,
                (50 + (random()*50))::int,
                (120 + (random()*300))::int,
                NOW() - (j * interval '3 days'), NOW()
            );
        END LOOP;
    END LOOP;

END $$;

-- ================================================================
-- Seeding complete! Total records: ~7000+
-- Login as: admin@ims.com / password123
-- ================================================================
