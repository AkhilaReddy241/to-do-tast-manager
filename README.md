# To-Do Task Manager — React + Spring Boot + MySQL

## Structure
- `frontend/`: React, Vite, HTML/CSS, Lucide icons
- `backend/`: Java 17+, Spring Boot REST API, Maven, MySQL

## Prerequisites
Install JDK 17+, Maven, MySQL Server, and Node.js LTS.
VS Code extensions recommended: Extension Pack for Java, Spring Boot Extension Pack.

## 1. Configure database
Create the database in MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS todo_manager;
```
Edit `backend/src/main/resources/application.properties` and replace `your_mysql_password` with your local MySQL password.

## 2. Start backend
Open terminal 1 in VS Code:
```bash
cd backend
mvn spring-boot:run
```
Backend: `http://localhost:8080`

## 3. Start React frontend
Install Node.js LTS if needed. Open terminal 2:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (normally `http://localhost:5173`).

The backend CORS config permits `localhost:5173` and `127.0.0.1:5173`.

## REST API
- `GET /api/tasks` — list all
- `GET /api/tasks?status=PENDING` — pending
- `GET /api/tasks?status=COMPLETED` — completed
- `GET /api/tasks?search=report` — search
- `POST /api/tasks` — create
- `PUT /api/tasks/{id}` — edit
- `PATCH /api/tasks/{id}/status` — change status
- `DELETE /api/tasks/{id}` — delete

POST example:
```json
{
  "title": "Finish assignment",
  "description": "Complete the Java project",
  "deadline": "2026-10-17",
  "priority": "HIGH"
}
```
Status defaults to `PENDING`; priority defaults to `MEDIUM`.

## Troubleshooting
- `npm` not recognized: install Node.js LTS and restart VS Code.
- MySQL access denied: check the password in application.properties.
- CORS error: make sure the frontend runs at localhost:5173 or 127.0.0.1:5173 and backend is running.
- Maven missing: install Maven or use an IDE with Maven support.
