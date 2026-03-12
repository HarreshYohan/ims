"""
IMS Analytics Forecast Service
Uses sklearn linear regression for simple trend forecasting.
"""
import numpy as np
from sklearn.linear_model import LinearRegression


def forecast_trend(values, periods=3):
    """
    Given a list of numeric values, predict the next N periods using linear regression.
    Returns: { 'historical': [...], 'forecast': [...], 'trend': 'up'|'down'|'stable' }
    """
    if not values or len(values) < 2:
        return {"historical": values or [], "forecast": [], "trend": "stable"}

    X = np.arange(len(values)).reshape(-1, 1)
    y = np.array(values, dtype=float)

    model = LinearRegression()
    model.fit(X, y)

    future_X = np.arange(len(values), len(values) + periods).reshape(-1, 1)
    predictions = model.predict(future_X).tolist()

    slope = model.coef_[0]
    trend = "up" if slope > 0.5 else ("down" if slope < -0.5 else "stable")

    return {
        "historical": [round(v, 2) for v in values],
        "forecast": [round(p, 2) for p in predictions],
        "trend": trend,
        "slope": round(float(slope), 4),
    }


def forecast_revenue(revenue_df, periods=3):
    """Forecast future revenue from monthly income data."""
    if revenue_df.empty:
        return {"labels": [], "income": [], "expense": [], "forecast_income": [], "trend": "stable"}

    labels = revenue_df["month"].astype(str).tolist()
    income = revenue_df["income"].fillna(0).astype(float).tolist()
    expense = revenue_df["expense"].fillna(0).astype(float).tolist()

    fc = forecast_trend(income, periods)

    # Generate future labels
    import pandas as pd
    last_month = pd.Timestamp(revenue_df["month"].iloc[-1])
    future_labels = [(last_month + pd.DateOffset(months=i + 1)).strftime("%Y-%m") for i in range(periods)]

    return {
        "labels": labels + future_labels,
        "income": income + [None] * periods,
        "expense": expense + [None] * periods,
        "forecast_income": [None] * len(income) + fc["forecast"],
        "trend": fc["trend"],
        "slope": fc["slope"],
    }


def forecast_enrollment(enrollment_df, periods=3):
    """Forecast student enrollment growth."""
    if enrollment_df.empty:
        return {"labels": [], "counts": [], "forecast": [], "trend": "stable"}

    labels = enrollment_df["month"].astype(str).tolist()
    counts = enrollment_df["count"].fillna(0).astype(int).tolist()
    fc = forecast_trend(counts, periods)

    import pandas as pd
    last = pd.Timestamp(enrollment_df["month"].iloc[-1])
    future = [(last + pd.DateOffset(months=i + 1)).strftime("%Y-%m") for i in range(periods)]

    return {
        "labels": labels + future,
        "counts": counts + [None] * periods,
        "forecast": [None] * len(counts) + fc["forecast"],
        "trend": fc["trend"],
    }


def forecast_fee_recovery(fees_df):
    """Predict fee recovery rate."""
    if fees_df.empty:
        return {"paid": 0, "pending": 0, "overdue": 0, "waived": 0, "recovery_rate": 0}

    result = {"paid": 0, "pending": 0, "overdue": 0, "waived": 0}
    for _, row in fees_df.iterrows():
        status = row.get("status", "").upper()
        total = float(row.get("total", 0) or 0)
        if status == "PAID":
            result["paid"] = total
        elif status == "PENDING":
            result["pending"] = total
        elif status == "OVERDUE":
            result["overdue"] = total
        elif status == "WAIVED_OFF":
            result["waived"] = total

    grand = result["paid"] + result["pending"] + result["overdue"]
    result["recovery_rate"] = round(result["paid"] / grand * 100, 1) if grand > 0 else 0
    return result


def predict_student_grade(quiz_scores):
    """Simple grade prediction from quiz score trend."""
    if not quiz_scores or len(quiz_scores) < 2:
        return {"predicted_score": None, "trend": "stable"}

    fc = forecast_trend(quiz_scores, 1)
    predicted = fc["forecast"][0] if fc["forecast"] else None
    if predicted is not None:
        predicted = max(0, min(100, predicted))

    grade_map = [
        (90, "A+"), (80, "A"), (70, "B+"), (60, "B"), (50, "C"), (40, "D"), (0, "F")
    ]
    grade_letter = "N/A"
    if predicted is not None:
        for threshold, letter in grade_map:
            if predicted >= threshold:
                grade_letter = letter
                break

    return {
        "predicted_score": round(predicted, 1) if predicted else None,
        "predicted_grade": grade_letter,
        "trend": fc["trend"],
    }
