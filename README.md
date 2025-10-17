# Task Management App - Full Stack Challenge

A minimal CRUD mobile app built with **React Native (Expo)** + **Node.js (Express)** demonstrating full-stack development.

## Features

✅ User authentication with JWT  
✅ SQLite database with seed data  
✅ Full CRUD operations on tasks  
✅ Two screens: Login + Task Management  
✅ Responsive mobile UI  
✅ API documentation (Swagger)  
✅ Docker-ready deployment

## Quick Start

### Prerequisites

-   **Node.js** ≥ 18.x
-   **pnpm** ≥ 8.x (or use `npm install -g pnpm`)
-   **Docker + Docker Compose** (for backend)
-   **Expo Go** app (for mobile testing)

### 1. Install

```bash
git clone https://github.com/lishine/assignment-rsbr-react-native.git

pnpm install
```

### 2. Environment variables setup

-   Copy `.env.example` to `.env.local`
-   Edit EXPO_PUBLIC_API_URL with your machine ip or Tailscale ip

### 3. Start Backend

```bash
docker compose up --build
```

The backend will:

-   Initialize Postgress database
-   Seed test data
-   Run on `http://localhost:3000`
-   Expose Swagger UI at `http://localhost:3000/api-docs`
-   Expose health check at `http://localhost:3000/health`

### 4. Start Mobile

```bash
cd packages/mobile
pnpm start
```

-   Run expo-go on Android and scan the qr-code from terminal. You should then see login screen. If backend running by then and tunnel to PC created, you will be able to login.

-   Then scan the QR code with **Expo Go** app.

---

## Tech Stack

### Backend

-   **Express.js** - REST API framework
-   **TypeScript** - Type-safe backend
-   **SQLite** - Embedded database
-   **JWT** - Authentication
-   **Swagger UI** - API documentation
-   **tsx** - Run TypeScript directly (no build step)

### Frontend

-   **React Native** - Cross-platform mobile
-   **Expo** - Easy development & APK builds
-   **React Navigation** - Stack navigation
-   **ofetch** - Lightweight HTTP client
-   **expo-secure-store** - Secure token storage

### DevOps

-   **Docker + Docker Compose** - Containerized backend
-   **pnpm** - Monorepo package manager

### Docker issues

```bash
# Stop containers
docker compose down

# Rebuild
docker compose up --build --force-recreate

# View logs
docker compose logs backend -f
```

---

## Possible Improvements (Out of Scope)

### Backend

-   [ ] Refresh token rotation
-   [ ] Input validation (Zod/Joi)
-   [ ] Rate limiting
-   [ ] Pagination for tasks
-   [ ] Task filtering/sorting
-   [ ] Unit tests (Jest)

### Frontend

-   [ ] Including image in a task
-   [ ] Drawing in a task
-   [ ] Pull-to-refresh
-   [ ] Search/filter UI
-   [ ] Theme, Dark mode, Animations
-   [ ] Unit tests
-   [ ] Offline support (local SQLite)

### DevOps

-   [ ] CI/CD pipelines (GitHub Actions)
-   [ ] Environment configs (dev/staging/prod)
-   [ ] Logging & monitoring

---

## Performance & Security Notes

### ✅ Implemented

-   JWT authentication for all protected routes
-   Bcrypt password hashing (10 rounds)
-   CORS enabled for frontend
-   Error handling middleware
-   SQL injection prevention (parameterized queries)

### 🔄 Recommendations for Production

-   Use HTTPS/TLS
-   Rotate JWT_SECRET regularly
-   Add rate limiting
-   Use PostgreSQL instead of SQLite
-   Add input validation with Zod/Joi
-   Implement refresh tokens
-   Add request logging
-   Use environment-specific configs

---

## Deployment

### Heroku / Railway / Fly.io

```bash
# Build image
docker build -f packages/backend/Dockerfile -t task-api:latest .

# Tag for registry
docker tag task-api:latest your-registry/task-api:latest

# Push to registry
docker push your-registry/task-api:latest

# Deploy with environment variables
# Set: JWT_SECRET, NODE_ENV=production
```

### APK Distribution

1. Build APK: `eas build --platform android --profile preview`
2. Download from EAS
3. Share APK file or via Google Play Store (requires account)

---

## License

MIT

---

## Summary

This project demonstrates:

-   ✅ Full-stack TypeScript development
-   ✅ JWT authentication patterns
-   ✅ CRUD operations with SQL
-   ✅ Mobile-backend integration
-   ✅ Docker containerization
-   ✅ Clean code architecture
-   ✅ API documentation
-   ✅ Production-ready patterns

---
