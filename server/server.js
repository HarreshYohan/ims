const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authenticate = require('./app/middleware/auth');
const logger = require('./app/lib/logger');
require('dotenv').config();

const app = express();

// Trust proxy is required for express-rate-limit when running behind a proxy (Docker, Nginx, etc.)
app.set('trust proxy', 1);

// ── Security middleware ──────────────────────────────────────
app.use(cors({
  origin: true, // Dynamically allow the requesting origin
  credentials: true,
}));

// Global rate limiter: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// Strict rate limiter for auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Disable caching globally for API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Welcome ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Institute Management System API.' });
});

// ── Auth routes (public, stricter rate limit) ─────────────────
const loginRouter   = require('./app/routes/login.routes');
const profileRouter = require('./app/routes/profile.routes');
app.use('/api/v1/auth', authLimiter, loginRouter);
app.use('/api/v1/profile', profileRouter);

// ── Analytics proxy (Python FastAPI server) ───────────────────
const { createProxyMiddleware } = require('http-proxy-middleware');
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://analytics:8084';

// Use pathFilter to ensure we only proxy what we want
const analyticsProxyOptions = {
  target: ANALYTICS_URL,
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\//, '/api/analytics/'),
  timeout: 60000,
  proxyTimeout: 60000,
};

const reportsProxyOptions = {
  target: ANALYTICS_URL,
  changeOrigin: true,
  pathRewrite: (path) => path.replace(/^\//, '/api/reports/'),
  timeout: 60000,
  proxyTimeout: 60000,
};

app.use('/api/v1/analytics', authenticate, createProxyMiddleware(analyticsProxyOptions));
app.use('/api/v1/reports', authenticate, createProxyMiddleware(reportsProxyOptions));

// ── Protected routes (authentication required) ───────────────
const autoAudit = require('./app/middleware/autoAudit');

const studentRouter     = require('./app/routes/student.routes');
const tutorRouter       = require('./app/routes/tutor.routes');
const staffRouter       = require('./app/routes/staff.routes');
const classroomRouter   = require('./app/routes/classroom.routes');
const subjectRouter     = require('./app/routes/subject.routes');
const subjectTutorRouter = require('./app/routes/subject_tutor.routes');
const timetableRouter   = require('./app/routes/timetable.routes');
const dashboardRouter   = require('./app/routes/dashboard.routes');
const gradeRouter       = require('./app/routes/grade.routes');
const chatroomRouter    = require('./app/routes/chatroom.routes');
const notesRouter       = require('./app/routes/notes.routes');
const goalsRouter       = require('./app/routes/goals.routes');
const leaveRouter       = require('./app/routes/leave.routes');
const scheduleRouter    = require('./app/routes/schedule_request.routes');
const studentFeesRouter = require('./app/routes/student_fees.routes');
const transactionRouter = require('./app/routes/transaction.routes');
const tutorPaymentRouter = require('./app/routes/tutor_payments.routes');
const studentSubjectRouter = require('./app/routes/student_subject.routes');
const userRouter        = require('./app/routes/user.routes');
const flashcardRouter   = require('./app/routes/flashcard.routes');
const quizRouter        = require('./app/routes/quiz.routes');
const activityLogRouter = require('./app/routes/activity_log.routes');
const syllabusRouter    = require('./app/routes/syllabus.routes');

app.use('/api/v1/students',        authenticate, autoAudit('student'), studentRouter);
app.use('/api/v1/tutors',          authenticate, autoAudit('tutor'), tutorRouter);
app.use('/api/v1/staff',           authenticate, autoAudit('staff'), staffRouter);
app.use('/api/v1/classrooms',      authenticate, autoAudit('classroom'), classroomRouter);
app.use('/api/v1/subjects',        authenticate, autoAudit('subject'), subjectRouter);
app.use('/api/v1/subject-tutors',  authenticate, autoAudit('subject_tutor'), subjectTutorRouter);
app.use('/api/v1/timetable',       authenticate, autoAudit('timetable'), timetableRouter);
app.use('/api/v1/dashboard',       authenticate, dashboardRouter);
app.use('/api/v1/grades',          authenticate, autoAudit('grade'), gradeRouter);
app.use('/api/v1/chatroom',        authenticate, autoAudit('chatroom'), chatroomRouter);
app.use('/api/v1/notes',           authenticate, autoAudit('notes'), notesRouter);
app.use('/api/v1/goals',           authenticate, autoAudit('goals'), goalsRouter);
app.use('/api/v1/leave',           authenticate, autoAudit('leave'), leaveRouter);
app.use('/api/v1/schedule-requests', authenticate, autoAudit('schedule_request'), scheduleRouter);
app.use('/api/v1/syllabus',        authenticate, autoAudit('syllabus'), syllabusRouter);
app.use('/api/v1/student-fees',    authenticate, autoAudit('student_fees'), studentFeesRouter);
app.use('/api/v1/transactions',    authenticate, autoAudit('transaction'), transactionRouter);
app.use('/api/v1/tutor-payments',  authenticate, autoAudit('tutor_payment'), tutorPaymentRouter);
app.use('/api/v1/student-subjects',authenticate, autoAudit('student_subject'), studentSubjectRouter);
app.use('/api/v1/users',           authenticate, autoAudit('user'), userRouter);
app.use('/api/v1/flashcards',      authenticate, autoAudit('flashcard'), flashcardRouter);
app.use('/api/v1/quiz',            authenticate, autoAudit('quiz'), quizRouter);
app.use('/api/v1/activity-logs',   authenticate, activityLogRouter);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  logger.error(`${req.method} ${req.url} — ${err.message}`, { stack: err.stack });
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error.'
    : err.message;
  res.status(status).json({ error: message });
});

const PORT = process.env.APP_PORT || 8083;
app.listen(PORT, () => {
  logger.info(`IMS API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
