# Task Management App - Full Stack Challenge

A minimal CRUD mobile app built with **React Native (Expo)** + **Node.js (Express)** demonstrating full-stack development in 7 hours.

## Features

✅ User authentication with JWT  
✅ SQLite database with seed data  
✅ Full CRUD operations on tasks  
✅ Two screens: Login + Task Management  
✅ Responsive mobile UI  
✅ API documentation (Swagger)  
✅ Docker-ready deployment  

---

## Tech Stack

### Backend
- **Express.js** - REST API framework
- **TypeScript** - Type-safe backend
- **SQLite** - Embedded database
- **JWT** - Authentication
- **Swagger UI** - API documentation
- **tsx** - Run TypeScript directly (no build step)

### Frontend
- **React Native** - Cross-platform mobile
- **Expo** - Easy development & APK builds
- **React Navigation** - Stack navigation
- **ofetch** - Lightweight HTTP client
- **expo-secure-store** - Secure token storage

### DevOps
- **Docker + Docker Compose** - Containerized backend
- **pnpm** - Monorepo package manager

---

## Project Structure

```
packages/
├── backend/              # Express API
│   ├── src/
│   │   ├── index.ts         # Server entry
│   │   ├── types.ts         # Type definitions
│   │   ├── config/database.ts
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── utils/seed.ts
│   ├── Dockerfile
│   └── package.json
│
└── mobile/              # Expo React Native
    ├── App.tsx
    ├── src/
    │   ├── screens/
    │   ├── services/api.ts
    │   ├── navigation/
    │   ├── components/
    │   └── utils/storage.ts
    ├── app.json
    └── package.json
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **pnpm** ≥ 8.x (or use `npm install -g pnpm`)
- **Docker + Docker Compose** (for backend)
- **Expo Go** app (for mobile testing)

### 1. Install Dependencies

```bash
cd ~/dev/assigments/rn
pnpm install
```

### 2. Start Backend (Option A: Docker)

```bash
docker compose up --build
```

The backend will:
- Initialize SQLite database
- Seed test data
- Run on `http://localhost:3000`
- Expose Swagger UI at `http://localhost:3000/api-docs`

### 2. Start Backend (Option B: Local)

```bash
cd packages/backend
pnpm dev
```

### 3. Start Mobile

In a new terminal:

```bash
cd packages/mobile
pnpm install
pnpm start
```

Then scan the QR code with **Expo Go** app.

---

## API Endpoints

### Authentication

```bash
# Register new user
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Response
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-10-16T..."
  }
}
```

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "test1@example.com",
  "password": "password123"
}
```

### Tasks (Protected - Requires JWT)

```bash
# List all tasks
GET /api/tasks
Authorization: Bearer <token>

# Create task
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

# Update task (toggle completion)
PUT /api/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}

# Delete task
DELETE /api/tasks/1
Authorization: Bearer <token>
```

---

## Test Credentials

Demo users are seeded on first run:

| Email | Password | Tasks |
|-------|----------|-------|
| test1@example.com | password123 | 5 tasks |
| test2@example.com | password123 | 3 tasks |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT 0,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Building APK for Android

### Prerequisites
- EAS account (free at https://eas.dev)
- Expo CLI: `npm install -g eas-cli`

### Build Steps

```bash
cd packages/mobile

# One-time setup
eas login
eas build:configure

# Build APK (takes ~5-10 minutes)
eas build --platform android --profile preview

# Output: Download link to APK file
```

---

## Environment Variables

### Root Level (.env)
```bash
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Backend (.env or docker-compose)
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database/app.db
```

---

## Available Scripts

### Root (Monorepo)
```bash
pnpm install          # Install all dependencies
pnpm lint             # Run ESLint
pnpm format:check     # Check formatting
pnpm format:write     # Auto-format code
pnpm typecheck        # TypeScript check
pnpm test             # Run tests (if added)
```

### Backend
```bash
pnpm dev              # Dev mode with hot reload
pnpm start            # Production mode
pnpm seed             # Seed database
pnpm lint             # Lint code
pnpm typecheck        # Type check
```

### Mobile
```bash
pnpm start            # Start Expo dev server
pnpm android          # Open Android emulator
pnpm ios              # Open iOS simulator
pnpm web              # Web preview
pnpm build            # Build APK via EAS
```

---

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `packages/backend/src/`
   - Hot reload: `pnpm dev` (tsx watch)
   - Test with Swagger: `http://localhost:3000/api-docs`

2. **Mobile Changes**
   - Edit files in `packages/mobile/src/`
   - Hot reload: Auto-reload in Expo Go
   - Restart server if needed: `Ctrl+C`, then `pnpm start`

### Testing Workflow

1. Clear test data:
   ```bash
   cd packages/backend
   rm database/app.db
   pnpm seed
   ```

2. Test in Expo Go:
   - Logout if logged in
   - Restart app: Shake device → Reload
   - Try login with test credentials

---

## Troubleshooting

### Backend won't start
```bash
# Check Node version
node --version  # should be ≥18

# Rebuild dependencies
cd packages/backend
pnpm install

# Clear database and reseed
rm database/app.db
pnpm seed
```

### Mobile won't connect to backend
```bash
# Check IP address (not localhost!)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update EXPO_PUBLIC_API_URL in .env
# Example: http://192.168.1.100:3000/api

# Restart Expo: Ctrl+C then pnpm start
```

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

## AI Usage Notes

### Where AI Assisted

1. **Express + TypeScript Boilerplate** (20% time saved)
   - Controller/middleware patterns
   - Route organization
   - Error handling

2. **React Native Components** (15% time saved)
   - StyleSheet patterns
   - Navigation setup
   - Form handling

3. **Swagger/OpenAPI Generation** (10% time saved)
   - Endpoint documentation
   - Schema definitions

4. **Docker Configuration** (5% time saved)
   - Dockerfile optimization
   - Docker Compose setup

### AI Tools Used
- Cursor IDE (code completion)
- ChatGPT (architectural decisions, debugging)
- Claude (pattern generation)

### Transparency
- All code reviewed and validated
- No blind copy-paste; intentional structure
- Comments added for non-obvious logic
- TypeScript ensures type safety

---

## Possible Improvements (Out of Scope)

### Backend
- [ ] Refresh token rotation
- [ ] Input validation (Zod/Joi)
- [ ] Rate limiting
- [ ] Pagination for tasks
- [ ] Task filtering/sorting
- [ ] Unit tests (Jest)

### Frontend
- [ ] Offline support (local SQLite)
- [ ] Pull-to-refresh
- [ ] Search/filter UI
- [ ] Dark mode
- [ ] Animations
- [ ] Unit tests

### DevOps
- [ ] PostgreSQL instead of SQLite
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Environment configs (dev/staging/prod)
- [ ] Logging & monitoring (Sentry)

---

## Performance & Security Notes

### ✅ Implemented
- JWT authentication for all protected routes
- Bcrypt password hashing (10 rounds)
- CORS enabled for frontend
- Error handling middleware
- SQL injection prevention (parameterized queries)

### 🔄 Recommendations for Production
- Use HTTPS/TLS
- Rotate JWT_SECRET regularly
- Add rate limiting
- Use PostgreSQL instead of SQLite
- Add input validation with Zod/Joi
- Implement refresh tokens
- Add request logging
- Use environment-specific configs

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

## Support & Debugging

### Logs

Backend:
```bash
docker compose logs backend -f
# or
pnpm dev
```

Mobile:
```bash
pnpm start
# Check console output
```

### Database Inspection

```bash
cd packages/backend
sqlite3 database/app.db

# List tables
.tables

# View users
SELECT * FROM users;

# View tasks
SELECT * FROM tasks;
```

---

## License

MIT

---

## Summary

This project demonstrates:
- ✅ Full-stack TypeScript development
- ✅ JWT authentication patterns
- ✅ CRUD operations with SQL
- ✅ Mobile-backend integration
- ✅ Docker containerization
- ✅ Clean code architecture
- ✅ API documentation
- ✅ Production-ready patterns

**Built in ~7 hours with modern tooling and best practices.**

---

*Created: 2025-10-16*  
*Challenge: Roseberry Full-Stack Developer*
