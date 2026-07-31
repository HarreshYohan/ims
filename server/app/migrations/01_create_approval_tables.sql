CREATE TABLE IF NOT EXISTS staff_leave_requests (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_schedule_requests (
  id SERIAL PRIMARY KEY,
  subject_tutor_id INTEGER REFERENCES subject_tutor(id) ON DELETE CASCADE,
  timeslotid INTEGER NOT NULL,
  classroomid INTEGER REFERENCES classroom(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING_TUTOR',
  tutor_preferred_day VARCHAR(20),
  tutor_preferred_timeslotid INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
