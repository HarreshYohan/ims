"""
IMS Analytics Data Service
Connects to PostgreSQL, runs queries, returns clean pandas DataFrames.
"""
import os
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor

def get_conn():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "postgres"),
        port=int(os.getenv("POSTGRES_PORT", 5432)),
        user=os.getenv("POSTGRES_USER", "ims"),
        password=os.getenv("POSTGRES_PASSWORD", "ims"),
        dbname=os.getenv("POSTGRES_DB", "ims"),
    )

def query_df(sql, params=None):
    """Run SQL and return a pandas DataFrame."""
    conn = get_conn()
    try:
        df = pd.read_sql_query(sql, conn, params=params)
        return df
    finally:
        conn.close()

# ─── ADMIN QUERIES ─────────────────────────────────────────

def get_revenue_timeline():
    return query_df("""
        SELECT DATE_TRUNC('month', created_at) AS month,
               SUM(CASE WHEN transaction_type IN ('FEES','INCOME') THEN amount ELSE 0 END) AS income,
               SUM(CASE WHEN transaction_type IN ('SALARY','EXPENSE') THEN amount ELSE 0 END) AS expense
        FROM "transaction"
        WHERE created_at IS NOT NULL
        GROUP BY month ORDER BY month
    """)

def get_enrollment_timeline():
    return query_df("""
        SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS count
        FROM student WHERE created_at IS NOT NULL
        GROUP BY month ORDER BY month
    """)

def get_financial_summary():
    return query_df("""
        SELECT transaction_type, SUM(amount) AS total
        FROM "transaction" GROUP BY transaction_type
    """)

def get_staff_salary_distribution():
    return query_df("""
        SELECT CONCAT(title, ' ', firstname, ' ', lastname) AS name, salary
        FROM staff ORDER BY salary DESC
    """)

def get_top_subjects():
    return query_df("""
        SELECT s.name AS subject, COUNT(ss.id) AS enrollment_count
        FROM student_subject ss
        JOIN subject_tutor st ON ss.subjecttutorid = st.id
        JOIN subject s ON st.subjectid = s.id
        GROUP BY s.name ORDER BY enrollment_count DESC LIMIT 10
    """)

# ─── STAFF QUERIES ─────────────────────────────────────────

def get_fees_collection():
    return query_df("""
        SELECT status, COUNT(*) AS count, SUM(amount) AS total
        FROM student_fees GROUP BY status
    """)

def get_tutor_payments_timeline():
    return query_df("""
        SELECT CONCAT(year, '-', LPAD(month::TEXT, 2, '0'), '-01')::DATE AS period,
               SUM(totalpayment)::FLOAT AS total, SUM(received)::FLOAT AS received
        FROM tutor_payments GROUP BY year, month ORDER BY period
    """)

def get_classroom_utilization():
    return query_df("""
        SELECT c.name AS classroom,
            (CASE WHEN t.monday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.tuesday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.wednesday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.thursday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.friday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.saturday IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN t.sunday IS NOT NULL THEN 1 ELSE 0 END) AS slots_used
        FROM timetable t JOIN classroom c ON t.classroomid = c.id
    """)

def get_grade_enrollment():
    return query_df("""
        SELECT g.name AS grade, COUNT(DISTINCT ss.studentid) AS count
        FROM student_subject ss
        JOIN subject_tutor st ON ss.subjecttutorid = st.id
        JOIN grade g ON st.gradeid = g.id
        GROUP BY g.name ORDER BY count DESC
    """)

# ─── TUTOR QUERIES ─────────────────────────────────────────

def get_tutor_subjects(tutor_id):
    return query_df("""
        SELECT st.id, s.name AS subject, g.name AS grade, st.fees,
               COUNT(ss.id) AS student_count
        FROM subject_tutor st
        JOIN subject s ON st.subjectid = s.id
        JOIN grade g ON st.gradeid = g.id
        LEFT JOIN student_subject ss ON ss.subjecttutorid = st.id
        WHERE st.tutorid = %s
        GROUP BY st.id, s.name, g.name, st.fees
    """, [tutor_id])

def get_tutor_payments(tutor_id):
    return query_df("""
        SELECT CONCAT(year, '-', LPAD(month::TEXT, 2, '0'), '-01')::DATE AS period,
               totalpayment::FLOAT, received::FLOAT
        FROM tutor_payments WHERE tutorid = %s ORDER BY period
    """, [tutor_id])

def get_tutor_quiz_trends(tutor_id):
    return query_df("""
        SELECT DATE_TRUNC('week', qa.created_at) AS week,
               AVG(qa.score_percent) AS avg_score
        FROM quiz_attempt qa
        JOIN student_subject ss ON qa.studentid = ss.studentid
        JOIN subject_tutor st ON ss.subjecttutorid = st.id
        WHERE st.tutorid = %s AND qa.created_at IS NOT NULL
        GROUP BY week ORDER BY week
    """, [tutor_id])

# ─── STUDENT QUERIES ──────────────────────────────────────

def get_student_quiz_scores(student_id):
    return query_df("""
        SELECT subject, score_percent, created_at
        FROM quiz_attempt WHERE studentid = %s ORDER BY created_at
    """, [student_id])

def get_student_flashcard_stats(student_id):
    return query_df("""
        SELECT subject,
               COUNT(*) AS total,
               SUM(CASE WHEN repetitions >= 3 THEN 1 ELSE 0 END) AS mastered,
               SUM(CASE WHEN repetitions < 3 THEN 1 ELSE 0 END) AS learning
        FROM flashcard WHERE studentid = %s GROUP BY subject
    """, [student_id])

def get_student_goals(student_id):
    return query_df("""
        SELECT goaltitle, progress, streak, status, targetdate
        FROM goals WHERE studentid = %s ORDER BY created_at DESC
    """, [student_id])

def get_student_notes_count(student_id):
    return query_df("""
        SELECT subject, COUNT(*) AS count,
               SUM(CAST(points AS FLOAT)) AS total_xp
        FROM notes WHERE studentid = %s GROUP BY subject
    """, [student_id])

# ─── SUMMARY STAT QUERIES ──────────────────────────────────

def get_system_stats():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        stats = {}
        for table in ['student', 'tutor', 'staff', 'classroom', 'subject']:
            cur.execute(f'SELECT COUNT(*) AS c FROM "{table}"')
            stats[f'{table}_count'] = cur.fetchone()['c']
        cur.execute('SELECT SUM(amount) AS total FROM "transaction" WHERE transaction_type IN (\'FEES\',\'INCOME\')')
        row = cur.fetchone()
        stats['total_revenue'] = float(row['total'] or 0)
        cur.execute('SELECT SUM(amount) AS total FROM "transaction" WHERE transaction_type IN (\'SALARY\',\'EXPENSE\')')
        row = cur.fetchone()
        stats['total_expenses'] = float(row['total'] or 0)
        return stats
    finally:
        conn.close()
