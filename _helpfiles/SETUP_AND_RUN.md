## Sarvagyyam Prashanasaar — Setup and Run (Windows)

This document explains how a developer can set up and run the SrivaniWebApp project locally on Windows (PowerShell). It covers the frontend (Vite + React + TypeScript), backend (Node + Express + TypeScript), database (SQL Server / LocalDB), environment variables, and common troubleshooting steps.

---

Prerequisites
- Node.js >= 18 (LTS) installed and on PATH
- npm (comes with Node) or yarn
- Git
- SQL Server / SQL Server Express / LocalDB (for development)
- Optional: VS Code (recommended)

1) Clone the repository

 - Open PowerShell and run:

   git clone <repo-url> ; cd SrivaniWebApp

2) Install dependencies

 - Root (frontend)
   - From repo root (where `package.json` for the frontend exists):
     - npm: npm install
     - or yarn: yarn

 - Backend
   - cd backend
   - npm install

3) Configure the database (Local development)

 The project provides SQL scripts under `backend/database/`.

 - Create a LocalDB or SQL Server instance and run the schema script `Updated-Db.sql`.
 - Example using SQL Server Management Studio (SSMS):
   - Open SSMS, connect to (localdb) or your SQL Server instance.
   - Open `backend/database/Updated-Db.sql` and run it.

 - Example using sqlcmd (PowerShell):

   sqlcmd -S (localdb)\MSSQLLocalDB -i .\backend\database\deploy-schema-simple.sql

 Notes about the script:
 - The script creates a database named `SrivaniQuizDB` and tables such as `Users`, `Competitions`, `Questions`, etc.
 - If you need a different database name, modify the `USE SrivaniQuizDB;` and related CREATE DATABASE lines.

4) Backend configuration

 - Create a `.env` file inside the `backend` folder. Example variables used by this project (adjust as needed):

   PORT=4000
   DATABASE_HOST=localhost
   DATABASE_NAME=SrivaniQuizDB
   DATABASE_USER=your_sql_user
   DATABASE_PASSWORD=your_password
   JWT_SECRET=change_this_to_a_secure_random_value
   EMAIL_SMTP_HOST=smtp.example.com
   EMAIL_SMTP_PORT=587
   EMAIL_USER=you@example.com
   EMAIL_PASS=your_email_password

 - The backend expects SQL Server. The code uses `mssql`/`msnodesqlv8` packages. Example connection string in `backend/src/config/database.ts` typically comes from env variables. Keep credentials secure.

5) Run the backend (development)

 - From `backend` directory:
   - npm run dev

 - This runs `nodemon src/server.ts` (the TypeScript source). It requires `ts-node`/`ts-node-dev` or nodemon configured to run TS (already present in devDependencies).

 - To build and run the compiled backend:
   - npm run build
   - npm start

6) Run the frontend (development)

 - From the repo root (where the frontend `package.json` is):
   - npm run dev

 - By default Vite will start a dev server (commonly on http://localhost:5173). Open the printed URL in the browser.

7) Useful scripts (summary)

 - Frontend (root):
   - npm run dev — start Vite dev server
   - npm run build — build production assets
   - npm run preview — preview built site locally

 - Backend (backend folder):
   - npm run dev — start backend in dev mode (nodemon)
   - npm run build — compile TypeScript to `dist`
   - npm start — run compiled backend
   - npm test — run tests (if any)

8) Uploads and static files

 - Uploaded images are stored in `/backend/uploads` (or top-level `uploads/`) depending on configuration. Ensure the backend has write permissions to that folder.

9) Common troubleshooting

 - SQL connection errors:
   - Verify SQL Server / LocalDB is running.
   - Check `DATABASE_HOST`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD` in `.env`.
   - If using Integrated Security / Windows Auth, `msnodesqlv8` may be used. Confirm driver is installed.

 - Port conflicts:
   - Change `PORT` in `backend/.env` or change Vite port via env or CLI.

 - TypeScript / build issues:
   - Ensure correct Node version (>= 18).
   - Run `npm run build` in backend to see TypeScript errors.

 - Missing environment variables:
   - Look through `backend/src/config` for required env keys and add them to `.env`.

10) Running end-to-end locally

 - Start database
 - Start backend (npm run dev in `backend`)
 - Start frontend (npm run dev in root)
 - Open frontend URL and test login/quiz flows

11) Security notes

 - Do not commit `.env` or credentials to source control.
 - Use strong secrets for `JWT_SECRET`.

12) Next steps and helpful additions

 - Add a sample `.env.example` to `backend` to document required variables.
 - Add Dockerfiles and docker-compose for local dev to simplify setup.
 - Add a small script to run schema deploy automatically from `backend` package scripts.

---

If anything in this guide doesn't work for your environment, tell me the error output and I will update the instructions accordingly.
