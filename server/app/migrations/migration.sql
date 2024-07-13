-- CREATE user table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('STUDENT', 'TUTOR', 'ADMIN', 'STAFF', 'NA');
  END IF;
END $$;

DROP TABLE IF EXISTS "user";
CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL ,
  user_type user_type NOT NULL DEFAULT 'NA',
  createdat timestamptz DEFAULT CURRENT_TIMESTAMP,
  updatedat timestamptz DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< Updated upstream
-- DROP TABLE users;
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   username VARCHAR(255) NOT NULL UNIQUE,
--   email VARCHAR(255) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL ,
--   user_type user_type NOT NULL DEFAULT 'NA',
--   created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- 	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- --TRUNCATE BEFORE INSERTING-----
-- TRUNCATE users;
-- -- INSERT data into the users table
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- INSERT INTO users (username, email, password, user_type) VALUES
-- ('test_1', 'test_1@gmail.com', crypt('test_1', gen_salt('bf', 10)), 'ADMIN'), 
-- ('test_2', 'test_2@gmail.com', crypt('test_2', gen_salt('bf', 10)), 'TUTOR'),
-- ('test_3', 'test_3@gmail.com', crypt('test_3', gen_salt('bf', 10)), 'STAFF'),
-- ('test_4', 'test_4@gmail.com', crypt('test_4', gen_salt('bf', 10)), 'NA') ;
=======
-- -- --TRUNCATE BEFORE INSERTING-----
TRUNCATE "user";
-- -- INSERT data into the user table
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO "user" (username, email, password, user_type) VALUES
('test_1', 'test_1@gmail.com', crypt('123', gen_salt('bf', 10)), 'ADMIN'), 
('test_2', 'test_2@gmail.com', crypt('123', gen_salt('bf', 10)), 'TUTOR'),
('test_3', 'test_3@gmail.com', crypt('123', gen_salt('bf', 10)), 'STAFF'),
('test_4', 'test_4@gmail.com', crypt('123', gen_salt('bf', 10)), 'NA') ;
>>>>>>> Stashed changes
