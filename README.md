# CodeType

#### Video Demo: https://youtu.be/w3c9k4wiK14

## Description

CodeType is a browser-based typing coach designed for developers who want to practice typing actual code. Built with modern web technologies, it combines ORY Kratos authentication, a responsive React UI, and a robust Go backend that persistently tracks every practice session.

### Core Features

**Authentication & Security**  
ORY Kratos handles registration, login, email verification, password recovery, profile settings, and logout. ORY Oathkeeper validates sessions and injects the trusted `X-User-Id` header for secure API communication.

**Practice Workspace**  
CodeMirror editor renders curated code snippets in JavaScript, Python, and Go. The practice session runs entirely client-side with real-time WPM, accuracy, and error tracking. Pause, resume, stop, or start a new test without network delays. Sonner toasts provide instant feedback on every action.

**History Tracking**  
Each completed practice run is saved to PostgreSQL via `/api/private/history` and displayed in the History page with timestamps and performance averages. Clear your entire history with a single button that issues `DELETE /api/private/history`.

**Account Management**  
The Settings page uses Kratos self-service flows for updating profile information and passwords. Delete your account through a dedicated dialog that removes both your Kratos identity (via Admin API) and all practice history records before returning `204`.

**Email Verification**  
Kratos courier sends verification and recovery emails to Mailhog during development, allowing complete testing of email flows without external SMTP configuration.

## Tech Stack
- ![React](https://skillicons.dev/icons?i=react) React SPA with React Router, shadcn/ui components, TanStack Query, and React Hook Form.
- ![TypeScript](https://skillicons.dev/icons?i=ts) Strict typing across UI logic, hooks, and shared helpers.
- ![Vite](https://skillicons.dev/icons?i=vite) Vite dev server + build pipeline for fast local feedback.
- ![Tailwind](https://skillicons.dev/icons?i=tailwind) Tailwind CSS and ThemeToggle keep the layout responsive in light and dark modes.
- ![Go](https://skillicons.dev/icons?i=go) Go backend with chi routers, middleware, and embedded SQL migrations.
- ![PostgreSQL](https://skillicons.dev/icons?i=postgres) PostgreSQL tracks every practice run inside the `practice_history` table with constraints and indexes.
- ![Docker](https://skillicons.dev/icons?i=docker) Docker Compose orchestrates the entire stack.

## How to Run

1. **Create `.env` file in the repo root with required variables:**
   ```env
   POSTGRES_USER=codetype
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=codetype
   KRATOS_DSN=postgres://codetype:your_secure_password@postgres:5432/codetype?sslmode=disable
   BACKEND_DATABASE_DSN=postgres://codetype:your_secure_password@postgres:5432/codetype?sslmode=disable
   KRATOS_COOKIE_SECRET=your_32_char_secret_here_min
   KRATOS_DEFAULT_SECRET=your_32_char_secret_here_min
   KRATOS_CIPHER_SECRET=your_32_char_secret_here_min
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```
   This launches Postgres, Kratos (migrate/serve/courier), Oathkeeper, the Go backend, and Mailhog.

3. **Start the frontend** (in a separate terminal):
   ```bash
   cd frontend-service
   npm install
   VITE_API_BASE_URL=http://localhost:4455 VITE_KRATOS_PUBLIC_URL=http://localhost:4433 npm run dev
   ```

4. **Access the app:**
   - Frontend: `http://localhost:3000`
   - Mailhog: `http://localhost:8025`
   - Register a user, verify via Mailhog, and start practicing!

5. **Quick health check:**
   ```bash
   curl http://localhost:4455/api/public/ping
   ```
   Expected: `{"status":"ok"}`

## Project Structure

**Frontend** (`frontend-service/`)
- `src/app` — Providers (theme, query client, toasts) and the router definition.
- `src/pages` — Auth, Practice, History, Settings, Recovery, Verification, Index, and NotFound screens.
- `src/features` / `entities` / `processes` — Typing editor, stats panel, practice-session hook, history + account API helpers, and the Kratos flow client.
- `src/shared` — Hooks (`use-auth`), shared UI components, toasts, and utilities.

**Backend** (`backend-service/`)
- `cmd/server` — Go entrypoint that loads config, opens the database, wires middleware, mounts routes, and performs graceful shutdown.
- `internal` — Config loader, DB connector, migrations, HTTP handlers (`public`, `history`, `account`), middleware, storage repository, and the account service that wraps Kratos Admin.

**Authentication** (`auth-service/`)
- `kratos` — Identity schema and Kratos configuration for browser flows.
- `oathkeeper` — Proxy rules and header mutation config.

**Infrastructure**
- `docker-compose.yml` — Orchestrates Postgres, Kratos (migrate/serve/courier), Oathkeeper, backend, and Mailhog containers.
