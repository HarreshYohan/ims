"""
IMS Analytics Server — FastAPI
Independent Python microservice for data analytics, forecasting, and report generation.
Communicates only with the Node.js server via HTTP proxy.
"""
import os
import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Query, Header, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from dotenv import load_dotenv

# Ensure the analytics directory is in sys.path for robust imports
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

load_dotenv()

from services import data_service as ds
from services import forecast_service as fs
from services import report_service as rs

app = FastAPI(title="IMS Analytics", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "bff13db0fd1925c2a9e0e4101b2670f052fdb4bacde312babe767479b4f858c3")

# ── Auth ───────────────────────────────────────────────────

def verify_token(request: Request, authorization: str = Header(None)):
    """Validate JWT from the Authorization header forwarded by Node.js proxy."""
    if not authorization:
        # Fallback check
        authorization = request.headers.get("Authorization") or request.headers.get("authorization")
    
    print(f"DEBUG: verify_token called. Auth found: {'Yes' if authorization else 'No'}")
    if not authorization:
        print(f"DEBUG: All Headers received: {dict(request.headers)}")
        raise HTTPException(401, "Missing authorization header")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError as e:
        print(f"DEBUG: JWT Error: {str(e)}")
        raise HTTPException(403, f"Token error: {str(e)}")


@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Request {request.method} {request.url}")
    print(f"DEBUG: Headers: {dict(request.headers)}")
    response = await call_next(request)
    return response

# ── Health ─────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics"}


# ── Analytics Endpoints ────────────────────────────────────


@app.get("/api/analytics/admin")
def analytics_admin(user: dict = Depends(verify_token)):
    if user.get("user_type") not in ("ADMIN",):
        raise HTTPException(403, "Admin access required")

    revenue_df = ds.get_revenue_timeline()
    enrollment_df = ds.get_enrollment_timeline()
    financial_df = ds.get_financial_summary()
    salary_df = ds.get_staff_salary_distribution()
    subjects_df = ds.get_top_subjects()
    stats = ds.get_system_stats()

    return {
        "stats": stats,
        "revenue_forecast": fs.forecast_revenue(revenue_df),
        "enrollment_forecast": fs.forecast_enrollment(enrollment_df),
        "financial_summary": financial_df.to_dict(orient="records") if not financial_df.empty else [],
        "salary_distribution": salary_df.to_dict(orient="records") if not salary_df.empty else [],
        "top_subjects": subjects_df.to_dict(orient="records") if not subjects_df.empty else [],
    }


@app.get("/api/analytics/staff")
def analytics_staff(user: dict = Depends(verify_token)):
    if user.get("user_type") not in ("ADMIN", "STAFF"):
        raise HTTPException(403, "Staff access required")

    fees_df = ds.get_fees_collection()
    payments_df = ds.get_tutor_payments_timeline()
    util_df = ds.get_classroom_utilization()
    grade_df = ds.get_grade_enrollment()
    stats = ds.get_system_stats()

    return {
        "stats": stats,
        "fee_recovery": fs.forecast_fee_recovery(fees_df),
        "tutor_payments_timeline": payments_df.to_dict(orient="records") if not payments_df.empty else [],
        "classroom_utilization": util_df.to_dict(orient="records") if not util_df.empty else [],
        "grade_enrollment": grade_df.to_dict(orient="records") if not grade_df.empty else [],
    }


@app.get("/api/analytics/tutor")
def analytics_tutor(user: dict = Depends(verify_token)):
    if user.get("user_type") not in ("ADMIN", "STAFF", "TUTOR"):
        raise HTTPException(403, "Tutor access required")

    tutor_id = user.get("user_id")
    subjects_df = ds.get_tutor_subjects(tutor_id)
    payments_df = ds.get_tutor_payments(tutor_id)
    quiz_df = ds.get_tutor_quiz_trends(tutor_id)

    return {
        "my_subjects": subjects_df.to_dict(orient="records") if not subjects_df.empty else [],
        "payment_history": payments_df.to_dict(orient="records") if not payments_df.empty else [],
        "quiz_trends": quiz_df.to_dict(orient="records") if not quiz_df.empty else [],
    }


@app.get("/api/analytics/student")
def analytics_student(user: dict = Depends(verify_token)):
    student_id = user.get("user_id")

    quiz_df = ds.get_student_quiz_scores(student_id)
    flashcard_df = ds.get_student_flashcard_stats(student_id)
    goals_df = ds.get_student_goals(student_id)
    notes_df = ds.get_student_notes_count(student_id)

    quiz_scores = quiz_df["score_percent"].tolist() if not quiz_df.empty else []

    return {
        "quiz_scores": quiz_df.to_dict(orient="records") if not quiz_df.empty else [],
        "flashcard_stats": flashcard_df.to_dict(orient="records") if not flashcard_df.empty else [],
        "goals": goals_df.to_dict(orient="records") if not goals_df.empty else [],
        "notes_summary": notes_df.to_dict(orient="records") if not notes_df.empty else [],
        "grade_prediction": fs.predict_student_grade(quiz_scores),
    }


# ── Report Downloads ───────────────────────────────────────

@app.get("/api/reports/pdf/{role}")
def download_pdf(role: str, user: dict = Depends(verify_token)):
    role = role.upper()

    stats = ds.get_system_stats()
    sections = []

    if role == "ADMIN":
        subjects = ds.get_top_subjects()
        if not subjects.empty:
            sections.append({
                "title": "Top Enrolled Subjects",
                "type": "table",
                "headers": ["Subject", "Enrollments"],
                "rows": subjects.values.tolist(),
            })
        salary = ds.get_staff_salary_distribution()
        if not salary.empty:
            sections.append({
                "title": "Staff Salary Distribution",
                "type": "table",
                "headers": ["Staff Member", "Salary"],
                "rows": salary.values.tolist(),
            })
    elif role == "STAFF":
        fees = ds.get_fees_collection()
        recovery = fs.forecast_fee_recovery(fees)
        sections.append({
            "title": "Fee Recovery Summary",
            "type": "summary",
            "items": {
                "Paid": f"${recovery['paid']:,.0f}",
                "Pending": f"${recovery['pending']:,.0f}",
                "Overdue": f"${recovery['overdue']:,.0f}",
                "Recovery Rate": f"{recovery['recovery_rate']}%",
            },
        })
        grades = ds.get_grade_enrollment()
        if not grades.empty:
            sections.append({
                "title": "Grade-wise Enrollment",
                "type": "table",
                "headers": ["Grade", "Count"],
                "rows": grades.values.tolist(),
            })
    elif role == "TUTOR":
        subjects = ds.get_tutor_subjects(user["user_id"])
        if not subjects.empty:
            sections.append({
                "title": "My Subjects",
                "type": "table",
                "headers": ["Subject", "Grade", "Fees", "Students"],
                "rows": subjects[["subject", "grade", "fees", "student_count"]].values.tolist(),
            })
    elif role == "STUDENT":
        quiz = ds.get_student_quiz_scores(user["user_id"])
        if not quiz.empty:
            sections.append({
                "title": "Quiz Performance",
                "type": "table",
                "headers": ["Subject", "Score %", "Date"],
                "rows": quiz[["subject", "score_percent", "created_at"]].astype(str).values.tolist(),
            })

    pdf_bytes = rs.generate_pdf(role, sections, stats)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=IMS_{role}_Report.pdf"},
    )


@app.get("/api/reports/csv/{role}")
def download_csv(role: str, user: dict = Depends(verify_token)):
    role = role.upper()
    data = {}

    if role == "ADMIN":
        data["Top Subjects"] = ds.get_top_subjects()
        data["Revenue"] = ds.get_revenue_timeline()
        data["Enrollment"] = ds.get_enrollment_timeline()
    elif role == "STAFF":
        data["Fee Collection"] = ds.get_fees_collection()
        data["Grade Enrollment"] = ds.get_grade_enrollment()
    elif role == "TUTOR":
        data["My Subjects"] = ds.get_tutor_subjects(user["user_id"])
        data["Payments"] = ds.get_tutor_payments(user["user_id"])
    elif role == "STUDENT":
        data["Quiz Scores"] = ds.get_student_quiz_scores(user["user_id"])
        data["Flashcards"] = ds.get_student_flashcard_stats(user["user_id"])

    csv_bytes = rs.generate_csv(data)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=IMS_{role}_Data.csv"},
    )
