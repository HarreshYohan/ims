# IMS - Institute Management System (Restructured)

This project has been restructured into a multi-app architecture for better scalability and role segregation.

## Architecture Overview

- **client-admin**: Frontend for Admin and Staff (Management, HR, Finance).
- **client-portal**: Frontend for Students and Tutors (Learning, Dashboard).
- **server**: Node.js/Express API serving both frontends.
- **analytics**: Python/FastAPI service for data insights and forecasting.
- **db**: PostgreSQL database.

## Quick Start

### 1. Database Setup
Ensure PostgreSQL is running.
```bash
psql -U postgres -f db/schema.sql
psql -U postgres -d ims -f db/seed.sql
```

### 2. Run API Server (Port 8083)
```bash
cd server
npm install
npm start
```

### 3. Run Analytics Service (Port 8084)
```bash
cd analytics
# Create venv and install dependencies...
uvicorn main:app --reload
```

### 4. Run Admin App (Port 3000)
```bash
cd client-admin
npm install
npm start
```

### 5. Run Portal App (Port 3001)
```bash
cd client-portal
npm install
npm start
```

For detailed instructions, see [RUN_GUIDE.md](RUN_GUIDE.md).
