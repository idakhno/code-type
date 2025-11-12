# CodeType

Typing trainer for programming languages.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Go + Chi
- **Auth**: ORY Kratos + Oathkeeper
- **Database**: PostgreSQL

## Quick Start

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Start frontend:**
   ```bash
   cd frontend-service
   npm install
   npm run dev
   ```

3. **Open:** http://localhost:3000

## Commands

```bash
# Frontend
cd frontend-service
npm run dev      # Dev server
npm run build    # Build

# Backend
cd backend-service
go run cmd/server/main.go

# Docker
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs -f  # Logs
```
