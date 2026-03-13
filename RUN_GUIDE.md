# IMS Run Guide - Multi-App Architecture

This guide explains how to start and run all components of the restructured Institute Management System.

## Architecture Overview
- **Database**: PostgreSQL (Port 5432)
- **API Server**: Node.js/Express (Port 8083)
- **Analytics Service**: Python/FastAPI (Port 8084)
- **Admin App**: React (Port 3000)
- **Portal App**: React (Port 3001)

---

## 1. Database Setup
Ensure you have PostgreSQL running.
1. Create a database named `ims`.
2. Run the schema:
   ```bash
   psql -U postgres -d ims -f db/schema.sql
   ```
3. (Optional) Seed initial data:
   ```bash
   psql -U postgres -d ims -f db/seed.sql
   ```

---

## 2. API Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env` (copy `.env.example` if needed).
4. Start the server:
   ```bash
   npm start
   ```

---

## 3. Analytics Service
1. Navigate to the `analytics` directory:
   ```bash
   cd analytics
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Start the service:
   ```bash
   python main.py
   ```

---

## 4. Admin App (Staff & Admin)
1. Navigate to the `client-admin` directory:
   ```bash
   cd client-admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   PORT=3000 npm start
   ```

---

## 5. Portal App (Student & Tutor)
1. Navigate to the `client-portal` directory:
   ```bash
   cd client-portal
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   PORT=3001 npm start
   ```

---

## Troubleshooting
- **CORS Errors**: Ensure `ALLOWED_ORIGINS` in `server/.env` includes both `http://localhost:3000` and `http://localhost:3001`.
- **Database Connection**: Verify DB credentials in `server/.env` and `analytics/.env`.
- **Port Conflicts**: Use different `PORT` environment variables if the default ports are occupied.
