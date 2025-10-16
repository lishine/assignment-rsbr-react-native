# Project Folder Structure

## Overview
PNPM monorepo with two packages: `backend` (Express API) and `mobile` (Expo React Native)

---

## Complete Structure

```
~/dev/assigments/rn/                 # Root monorepo
│
├── packages/
│   │
│   ├── backend/                     # Express API Package
│   │   ├── src/
│   │   │   ├── index.ts            # Express app entry point
│   │   │   ├── types.ts            # Shared TypeScript types
│   │   │   ├── config/
│   │   │   │   └── database.ts     # SQLite setup & schema
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts         # JWT verification middleware
│   │   │   │   └── errorHandler.ts # Global error handler
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts  # POST /api/auth/register, /login
│   │   │   │   └── tasks.routes.ts # GET/POST/PUT/DELETE /api/tasks
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts   # Auth business logic
│   │   │   │   └── tasks.controller.ts  # CRUD business logic
│   │   │   ├── utils/
│   │   │   │   └── seed.ts         # Database seed script
│   │   │   └── swagger.ts          # OpenAPI/Swagger config
│   │   ├── database/
│   │   │   └── app.db              # SQLite database file (git-ignored)
│   │   ├── Dockerfile              # Backend container
│   │   ├── package.json            # Backend dependencies
│   │   ├── tsconfig.json           # Backend TS config
│   │   └── .env.example            # Environment variables template
│   │
│   └── mobile/                     # Expo React Native Package
│       ├── App.tsx                 # Root component
│       ├── src/
│       │   ├── types.ts            # Shared TypeScript types
│       │   ├── navigation/
│       │   │   └── AppNavigator.tsx  # Stack navigator setup
│       │   ├── screens/
│       │   │   ├── LoginScreen.tsx   # Login + Register
│       │   │   ├── TasksScreen.tsx   # Main task list (CRUD)
│       │   │   └── TaskFormScreen.tsx # Add/Edit task modal
│       │   ├── services/
│       │   │   └── api.ts          # ofetch wrapper + API calls
│       │   ├── utils/
│       │   │   └── storage.ts      # JWT token storage (expo-secure-store)
│       │   └── components/
│       │       ├── TaskItem.tsx    # Single task list item
│       │       └── ErrorMessage.tsx # Error display component
│       ├── app.json                # Expo config
│       ├── eas.json                # EAS Build config for APK
│       ├── package.json            # Mobile dependencies
│       └── tsconfig.json           # Mobile TS config
│
├── .github/
│   └── workflows/
│       ├── quality.yml             # CI: lint, typecheck, test
│       └── release.yml             # CD: changesets release
│
├── .changeset/                     # Changeset configs
├── .vscode/                        # VSCode settings
├── docker-compose.yml              # Docker services orchestration
├── pnpm-workspace.yaml             # PNPM workspace config
├── package.json                    # Root workspace scripts
├── tsconfig.json                   # Base TS config
├── .eslintrc.json                  # ESLint config
├── prettier.config.js              # Prettier config
├── vitest.config.ts                # Vitest test config
├── .env.example                    # Root env template
├── .gitignore                      # Git ignore patterns
├── README.md                       # Setup & usage docs
├── STRUCTURE.md                    # This file
└── plan.md                         # Implementation plan
```

---

## Package Details

### Backend Package (`packages/backend`)

**Purpose**: REST API with JWT authentication and CRUD operations for tasks

**Key Files**:
- `src/index.ts` - Express server setup, middleware, routes
- `src/config/database.ts` - SQLite connection, schema creation
- `src/middleware/auth.ts` - JWT verification for protected routes
- `src/routes/*.routes.ts` - Route definitions
- `src/controllers/*.controller.ts` - Business logic handlers
- `src/swagger.ts` - OpenAPI documentation
- `src/utils/seed.ts` - Test data generation

**Dependencies**:
- express
- better-sqlite3
- jsonwebtoken
- bcrypt
- swagger-ui-express
- cors

**Scripts**:
```json
{
  "dev": "tsx watch src/index.ts",
  "build": "tsup",
  "start": "node dist/index.js",
  "seed": "tsx src/utils/seed.ts"
}
```

---

### Mobile Package (`packages/mobile`)

**Purpose**: Expo React Native app with login and task management

**Key Files**:
- `App.tsx` - Root component, navigation setup
- `src/screens/*.tsx` - Screen components
- `src/services/api.ts` - HTTP client (ofetch) + API endpoints
- `src/navigation/AppNavigator.tsx` - Stack navigator config
- `src/utils/storage.ts` - Secure token storage
- `src/components/*.tsx` - Reusable UI components

**Dependencies**:
- expo
- @react-navigation/native
- @react-navigation/stack
- ofetch
- expo-secure-store

**Scripts**:
```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "build": "eas build --platform android --profile preview"
}
```

---

## Key Decisions

### 1. PNPM Monorepo
- ✅ Single root for linting, formatting, TS config
- ✅ Shared tooling between packages
- ✅ Easy cross-package imports if needed
- ✅ Unified CI/CD pipeline

### 2. SQLite (Embedded)
- ✅ No separate database container needed
- ✅ Single file persistence
- ✅ Simplifies Docker setup
- ✅ Perfect for demo/challenge scope

### 3. Expo (React Native)
- ✅ Easiest APK builds (`eas build`)
- ✅ No Android Studio required
- ✅ Built-in modules (secure-store, etc.)
- ✅ Better developer experience

### 4. ofetch (HTTP Client)
- ✅ Lightweight (~3KB vs axios ~13KB)
- ✅ Auto JSON parsing
- ✅ Better TypeScript support
- ✅ Modern fetch-based API

### 5. Types Organization
- Use `types.ts` instead of `types/index.ts`
- Simpler for small projects
- Each package has its own types file
- Can extract to shared package later if needed

---

## Docker Setup

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### docker-compose.yml
```yaml
services:
  backend:
    build: ./packages/backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./packages/backend/database:/app/database
```

---

## API Endpoints

### Auth Routes (`/api/auth`)
- `POST /register` - Create user
- `POST /login` - Get JWT token

### Task Routes (`/api/tasks`) - Protected
- `GET /` - List user's tasks
- `POST /` - Create task
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task

### Docs
- `GET /api-docs` - Swagger UI

---

## Development Workflow

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Backend (in Docker)
```bash
docker compose up --build
```

### 3. Start Mobile (separate terminal)
```bash
cd packages/mobile
pnpm start
# Scan QR with Expo Go app
```

### 4. Run Tests
```bash
pnpm test
```

### 5. Lint & Format
```bash
pnpm lint
pnpm format:write
pnpm typecheck
```

---

## Build for Production

### Backend
```bash
cd packages/backend
pnpm build
docker compose up --build
```

### Mobile APK
```bash
cd packages/mobile
eas build --platform android --profile preview
# Wait ~5-10 mins, download APK from link
```

---

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database/app.db
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Testing Strategy

### Backend
- Manual API testing (Swagger UI or curl)
- Unit tests with Vitest (optional)

### Mobile
- Manual testing with Expo Go
- Jest + React Native Testing Library (optional)

### E2E
- Full flow: Register → Login → Create/Edit/Delete tasks
- Test on physical device before APK build

---

## Git Workflow

### Branches
- `main` - Production-ready code
- `develop` - Development branch
- Feature branches: `feature/task-crud`, `feature/auth`, etc.

### Commits
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Tooling, config
- `docs:` - Documentation
- `refactor:` - Code restructuring

---

## Next Steps

1. ✅ Folder structure defined
2. Create backend package structure
3. Setup backend dependencies
4. Implement auth + CRUD
5. Setup mobile package
6. Build screens
7. Docker configuration
8. Testing & documentation

---

*Updated: 2025-10-16*
