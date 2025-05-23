

-- Drop existing schema if it exists
DROP SCHEMA IF EXISTS public CASCADE;

-- Create new schema
CREATE SCHEMA public;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create user_type ENUM if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('STUDENT', 'TUTOR', 'ADMIN', 'STAFF', 'NA');
    CREATE TYPE transaction_type AS ENUM ('SALARY', 'FEES', 'INCOME', 'EXPENSE', 'OTHER');
    CREATE TYPE fees_status AS ENUM('PAID', 'WAIVED_OFF', 'PENDING', 'OVERDUE');
  END IF;
END $$;

-- Drop existing tables
DROP TABLE IF EXISTS "student_subject";
DROP TABLE IF EXISTS "subject_tutor";
DROP TABLE IF EXISTS "staff";
DROP TABLE IF EXISTS "tutor";
DROP TABLE IF EXISTS "student";
DROP TABLE IF EXISTS "grade";
DROP TABLE IF EXISTS "subject";
DROP TABLE IF EXISTS "classroom";
DROP TABLE IF EXISTS "timetable";
DROP TABLE IF EXISTS "chatroom";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS "transaction";
DROP TABLE IF EXISTS "student_fees";

-- Create student table
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
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
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
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
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
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL DEFAULT 'NA',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "subject" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE CHECK (name = UPPER(name)),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "grade" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "classroom" (
  id SERIAL PRIMARY KEY,
  capacity INT NOT NULL DEFAULT 10,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "subject_tutor" (
  id SERIAL PRIMARY KEY,
  subjectid INTEGER REFERENCES subject(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  tutorid INTEGER REFERENCES tutor(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  gradeid INTEGER REFERENCES grade(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  fees INT NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "student_subject" (
    id SERIAL PRIMARY KEY,
    studentid INTEGER NOT NULL,
    subjecttutorid INTEGER REFERENCES subject(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (studentid) REFERENCES student(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "chatroom" (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(2000) NOT NULL,
  subjecttutorid INT NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP ,
  FOREIGN KEY (subjecttutorid) REFERENCES subject_tutor(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES student(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "transaction" (
  id SERIAL PRIMARY KEY,
  transaction_type transaction_type  NOT NULL DEFAULT 'OTHER',
  amount INTEGER NOT NULL,
  description VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL,
  participant_id INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "timetable" (
    id SERIAL PRIMARY KEY,
    timeslot VARCHAR(255) NOT NULL,
    timeslotid VARCHAR(255) NOT NULL,
    classroomid INTEGER NOT NULL,
    monday INT,
    tuesday INT,
    wednesday INT,
    thursday INT,
    friday INT,
    saturday INT,
    sunday INT,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (classroomid) REFERENCES classroom(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "student_fees" (
    id SERIAL PRIMARY KEY,
    studentid INT NOT NULL,
    month VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    totalAmount FLOAT NOT NULL,
    status fees_status NOT NULL DEFAULT 'PENDING',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (studentid) REFERENCES student(id)
);


INSERT INTO "user" (username,email, password,user_type,is_active) VALUES
	 ('student1','student1@gmail.com', crypt('123', gen_salt('bf', 10)),'STUDENT',true),
	 ('tutor1','tutor1@gmail.com', crypt('123', gen_salt('bf', 10)),'TUTOR',true),
	 ('staff1', 'staff1@gmail.com', crypt('123', gen_salt('bf', 10)),'STAFF',true);


-- Insert records into student table
INSERT INTO "student" (user_id, username, email, password, firstname, lastname, contact, grade)
VALUES
  (1,'student1', 'student1@gmail.com', crypt('123', gen_salt('bf', 10)), 'John', 'Doe', '123456789', 'Grade 10'),
  (5,'student2', 'student2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Jane', 'Smith', '987654321', 'Grade 11'),
  (6,'student3', 'student3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Michael', 'Johnson', '555123456', 'Grade 9'),
  (7,'student4', 'student4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Emily', 'Brown', '777888999', 'Grade 12'),
  (8,'student5', 'student5@gmail.com', crypt('123', gen_salt('bf', 10)), 'David', 'Lee', '111222333', 'Grade 11');


-- Insert records into tutor table
INSERT INTO "tutor" (user_id,username, email, password, title, firstname, lastname, contact)
VALUES
  (2,'tutor1', 'tutor1@gmail.com', crypt('123', gen_salt('bf', 10)), 'Professor', 'John', 'Smith', '555111222'),
  (0,'tutor2', 'tutor2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Instructor', 'Jane', 'Doe', '777888999'),
  (0,'tutor3', 'tutor3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Teacher', 'Michael', 'Johnson', '333444555'),
  (0,'tutor4', 'tutor4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Lecturer', 'Emily', 'Brown', '999888777'),
  (0,'tutor5', 'tutor5@gmail.com', crypt('123', gen_salt('bf', 10)), 'Educator', 'David', 'Lee', '111222333');


-- Insert records into staff table
INSERT INTO "staff" (user_id,username, email, password, title, firstname, lastname, position, contact, salary)
VALUES
  (3,'staff1', 'staff1@gmail.com', crypt('123', gen_salt('bf', 10)), 'Manager', 'John', 'Smith', 'HR Manager', '555111222',122222),
  (0,'staff2', 'staff2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Supervisor', 'Jane', 'Doe', 'IT Supervisor', '777888999',123232),
  (0,'staff3', 'staff3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Coordinator', 'Michael', 'Johnson', 'Admin Coordinator', '333444555',234234),
  (0,'staff4', 'staff4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Assistant', 'Emily', 'Brown', 'Executive Assistant', '999888777',234234),
  (0,'staff5', 'staff5@gmail.com', crypt('123', gen_salt('bf', 10)), 'Director', 'David', 'Lee', 'Technical Director', '111222333',2342344);


-- Insert records into subject table
INSERT INTO "subject" (name)
VALUES
  ('MATHEMATICS'),
  ('PHYSICS'),
  ('CHEMISTRY'),
  ('BIOLOGY'),
  ('ENGLISH');


-- Insert records into grade table
INSERT INTO "grade" (name)
VALUES
  ('Grade 9'),
  ('Grade 10'),
  ('Grade 11'),
  ('Grade 12'),
  ('Grade 13');

-- Insert records into classroom table
INSERT INTO "classroom" (name, capacity)
VALUES
  ('Classroom A', 30),
  ('Classroom B', 25),
  ('Classroom C', 35),
  ('Classroom D', 20),
  ('Classroom E', 40);

-- Insert records into subject tutor table
INSERT INTO "subject_tutor" ( tutorid, subjectid, gradeid, fees)
VALUES
  (1,1,1, 3000),
  (1,2,1, 4000),
  (2,3,1, 5000),
  (3,1,5, 2500);

INSERT INTO "student_subject" ( studentid, subjecttutorid)
VALUES
  (1,2),
  (2,4),
  (1,3),
  (2,3),
  (1,4),
  (3,4);

INSERT INTO "timetable" (timeslot, timeslotid,classroomid, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES 
('7.00-9.00',1,1,2,3,4,3,4,1,2),
('9.00-11.00',2,1,2,3,4,3,4,1,2),
('11.00-13.00',3,1,2,3,4,3,4,1,2),
('13.00-15.00',4,1,2,3,4,3,4,1,2),
('15.00-17.00',5,1,2,3,4,3,4,1,2),
('17.00-19.00',6,1,2,3,4,3,4,1,2),
('19.00-21.00',7,1,2,3,4,3,4,1,2);

INSERT INTO chatroom (user_id, message, subjecttutorid, created_at, updated_at) VALUES
(1, 'Hello, I need help with the math homework.', 1, '2024-07-01 09:00:00', '2024-07-01 09:00:00'),
(2, 'Can we reschedule the physics class?', 1, '2024-07-02 10:00:00', '2024-07-02 10:00:00'),
(3, 'Is there any additional material for the history exam?', 1, '2024-07-03 11:00:00', '2024-07-03 11:00:00'),
(4, 'I have a question about the science project.', 1, '2024-07-04 12:00:00', '2024-07-04 12:00:00'),
(5, 'When is the next English class?', 1, '2024-07-05 13:00:00', '2024-07-05 13:00:00'),

(1, 'Can you explain the math problem on page 32?', 2, '2024-07-06 09:00:00', '2024-07-06 09:00:00'),
(2, 'I will be late for the chemistry class.', 2, '2024-07-07 10:00:00', '2024-07-07 10:00:00'),
(2, 'Is there any assignment due tomorrow?', 2, '2024-07-08 11:00:00', '2024-07-08 11:00:00'),
(1, 'What chapters will be covered in the test?', 2, '2024-07-09 12:00:00', '2024-07-09 12:00:00'),
(3, 'Can we have a revision class?', 2, '2024-07-10 13:00:00', '2024-07-10 13:00:00'),

(1, 'I am struggling with the physics concepts.', 3, '2024-07-11 09:00:00', '2024-07-11 09:00:00'),
(2, 'Can you recommend any extra reading material?', 3, '2024-07-12 10:00:00', '2024-07-12 10:00:00'),
(2, 'When is the next test?', 3, '2024-07-13 11:00:00', '2024-07-13 11:00:00'),
(4, 'I have completed the assignment.', 3, '2024-07-14 12:00:00', '2024-07-14 12:00:00'),
(5, 'What is the homework for this week?', 3, '2024-07-15 13:00:00', '2024-07-15 13:00:00'),

(3, 'Can you review my project draft?', 4, '2024-07-16 09:00:00', '2024-07-16 09:00:00'),
(5, 'I need help with the algebra problems.', 4, '2024-07-17 10:00:00', '2024-07-17 10:00:00'),
(2, 'When will the results be announced?', 4, '2024-07-18 11:00:00', '2024-07-18 11:00:00'),
(1, 'Is there a make-up class for the missed lecture?', 4, '2024-07-19 12:00:00', '2024-07-19 12:00:00'),
(2, 'Can you explain the experiment procedure again?', 4, '2024-07-20 13:00:00', '2024-07-20 13:00:00'),

(1, 'What topics will be covered in the next session?', 2, '2024-07-21 09:00:00', '2024-07-21 09:00:00'),
(2, 'I need clarification on the last lecture.', 3, '2024-07-22 10:00:00', '2024-07-22 10:00:00'),
(3, 'Can you suggest any study tips?',2, '2024-07-23 11:00:00', '2024-07-23 11:00:00'),
(4, 'When is the submission deadline for the project?', 4, '2024-07-24 12:00:00', '2024-07-24 12:00:00'),
(5, 'I need help with my homework.', 3, '2024-07-25 13:00:00', '2024-07-25 13:00:00');


INSERT INTO "transaction" (transaction_type, amount, description, user_id, participant_id, created_at, updated_at) VALUES
('SALARY', 5000, 'Monthly salary', 1, 2, '2024-07-01 09:00:00', '2024-07-01 09:00:00'),
('FEES', 200, 'Library fees', 2, 3, '2024-07-02 10:00:00', '2024-07-02 10:00:00'),
('INCOME', 1500, 'Freelance project payment', 1, 4, '2024-07-03 11:00:00', '2024-07-03 11:00:00'),
('EXPENSE', 300, 'Office supplies', 3, NULL, '2024-07-04 12:00:00', '2024-07-04 12:00:00'),
('OTHER', 100, 'Miscellaneous', 4, 1, '2024-07-05 13:00:00', '2024-07-05 13:00:00');

