# Task Management App - Full Stack Challenge

A minimal CRUD mobile app built with **React Native (Expo)** + **Node.js (Express)** demonstrating full-stack development.

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

-   Create `.env.local` (copy from `.env.example`)
-   Configure mobile API URL: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
    -   Replace `YOUR_IP` with your machine IP (find with `ipconfig getifaddr en0` on macOS) or Tailscale service ip

Backend environment variables (handled by docker-compose):

-   `JWT_SECRET` - Secret key for JWT signing
-   `JWT_EXPIRES_IN` - Token expiration (default: 7d)

### 3. Start Backend

```bash
docker compose up --build
```

The backend will:

-   Initialize PostgreSQL database
-   Seed test data with 2 users and sample tasks
-   Run on `http://localhost:3000`
-   Expose Swagger UI at `http://localhost:3000/api-docs`
-   Expose health check at `http://localhost:3000/health`

### 4. Start Mobile

```bash
cd packages/mobile
pnpm start
```

-   Scan the QR code with **Expo Go** app
-   Login with test credentials:
    -   **Email**: `test1@example.com` | **Password**: `password123`
    -   **Email**: `test2@example.com` | **Password**: `password123`
-   If backend running by then and tunnel to PC created, you will be able to login.

---

## AI Usage Disclosure

This project was developed with AI assistance using Droid agent with Claude 4.5 and GLM 4.6 models

## Features

✅ User authentication with JWT  
✅ PostgreSQL database with seed data  
✅ Full CRUD operations on tasks  
✅ Two screens: Login + Task Management  
✅ Responsive mobile UI  
✅ API documentation (Swagger)  
✅ Docker-ready deployment

### Test Accounts

After running `docker compose up --build`, the database is seeded with:

| Email             | Password    | Available Tasks |
| ----------------- | ----------- | --------------- |
| test1@example.com | password123 | 5 sample tasks  |
| test2@example.com | password123 | 3 sample tasks  |

---

## API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - Login user

### Tasks (Authenticated)

-   `GET /api/tasks` - Get user's tasks
-   `POST /api/tasks` - Create new task
-   `PUT /api/tasks/:id` - Update task
-   `DELETE /api/tasks/:id` - Delete task

### Documentation & Health

-   `GET /api-docs` - Swagger UI documentation
-   `GET /health` - Service health check

## Tech Stack

### Backend

-   **Express.js** - REST API framework
-   **TypeScript** - Type-safe backend
-   **PostgreSQL** - Production-ready database
-   **JWT** - Authentication
-   **Swagger UI** - API documentation
-   **tsx** - Run TypeScript directly (no build step)
-   **Vitest** - Fast unit testing framework

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

## Testing

### Backend Testing

The backend includes comprehensive unit tests using **Vitest** with 55+ test cases covering:

#### 🧪 Test Coverage

-   **Authentication Tests** (`auth.controller.test.ts`)

    -   User registration with validation
    -   User login with credential verification
    -   Error handling for invalid inputs
    -   JWT token generation and validation

-   **Task Management Tests** (`tasks.controller.test.ts`)

    -   CRUD operations (Create, Read, Update, Delete)
    -   Task ownership verification
    -   Image and drawing data handling
    -   Error handling and edge cases

-   **Database Models Tests** (`models.test.ts`)

    -   User operations (create, find by email/id)
    -   Task operations (CRUD with user isolation)
    -   SQL query validation
    -   Database connection handling

-   **Security Tests** (`utils/crypto.test.ts`)

    -   Password hashing with salt
    -   Password comparison with timing attack protection
    -   Edge cases and malformed inputs

-   **Middleware Tests** (`middleware/`)
    -   JWT token verification middleware
    -   Error handling middleware
    -   Security validation

#### 🚀 Running Tests

```bash
# Run all backend tests
cd packages/backend
pnpm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Possible Improvements (Out of Scope)

### Backend

-   [ ] Refresh token rotation
-   [ ] Input validation (Zod/Joi)
-   [ ] Rate limiting
-   [ ] Pagination for tasks
-   [ ] Task filtering/sorting
-   [v] Unit tests (Vitest)

### Frontend

-   [v] Including image in a task
-   [v] Drawing in a task
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

### APK Build Instructions

1. **Setup EAS CLI** (one-time):

    ```bash
    npm install -g eas-cli
    eas login
    ```

2. **Configure build profile** in `eas.json` (already included):

    ```json
    {
    	"build": {
    		"preview": {
    			"android": {
    				"buildType": "apk"
    			}
    		}
    	}
    }
    ```

3. **Build APK**:

    ```bash
    cd packages/mobile
    eas build --platform android --profile preview
    ```

4. **Download APK** from the provided link or EAS dashboard

5. **Install APK** on Android device:
    - Enable "Install from unknown sources" in settings
    - Transfer APK file to device and install

### APK Distribution Options

-   **Direct sharing**: Send APK file via email/messaging
-   **Google Play Store**: Requires developer account ($25)
-   **Enterprise distribution**: For internal company use

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
