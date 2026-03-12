# Multi-stage build for smaller final image
FROM python:3.11-slim as builder

WORKDIR /build

# Install build dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and build wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --user --no-warn-script-location \
    -r requirements.txt


# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install only runtime dependencies (not build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r analytics && useradd -r -g analytics analytics

# Copy Python packages from builder
COPY --from=builder /root/.local /home/analytics/.local

# Copy application code
COPY --chown=analytics:analytics . .

# Set Python path and environment
ENV PATH=/home/analytics/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Switch to non-root user
USER analytics

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8084/health || exit 1

EXPOSE 8084

# Run with gunicorn for production (instead of --reload)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8084"]