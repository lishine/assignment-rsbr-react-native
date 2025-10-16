# Roseberry Full-Stack Developer Challenge - Implementation Plan

## Overview
Building a minimal CRUD mobile app with React Native (Expo) + Node.js backend to demonstrate full-stack capabilities in ~7 hours.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express
- **Database**: SQLite (embedded, no separate container)
- **Authentication**: JWT (jsonwebtoken)
- **Documentation**: Swagger UI Express
- **Key Libraries**: 
  - express
  - typescript
  - better-sqlite3
  - jsonwebtoken
  - bcrypt
  - swagger-ui-express
  - cors

### Frontend
- **Framework**: Expo (React Native) with TypeScript
- **Navigation**: React Navigation
- **HTTP Client**: ofetch
- **Storage**: expo-secure-store (for JWT tokens)
- **Key Libraries**:
  - expo
  - @react-navigation/native
  - @react-navigation/stack
  - ofetch
  - expo-secure-store

### DevOps
- **Containerization**: Docker + Docker Compose
- **Environment**: .env for configuration

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hashed
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

### Seed Data
- 2 demo users (test1@example.com, test2@example.com)
- 5-10 sample tasks per user

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
  - Body: `{ email, password, name }`
  - Returns: `{ token, user }`
  
- `POST /api/auth/login` - Login existing user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

### Tasks (Protected - Requires JWT)
- `GET /api/tasks` - Get all tasks for authenticated user
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ tasks: [...] }`

- `POST /api/tasks` - Create new task
  - Body: `{ title, description? }`
  - Returns: `{ task }`

- `PUT /api/tasks/:id` - Update task
  - Body: `{ title?, description?, completed? }`
  - Returns: `{ task }`

- `DELETE /api/tasks/:id` - Delete task
  - Returns: `{ message }`

### Documentation
- `GET /api-docs` - Swagger UI

---

## Frontend Screens

### 1. Login Screen
- Email input (validation: required, email format)
- Password input (validation: required, min 6 chars)
- Login button
- "Create account" link → Register
- Loading state during API call
- Error message display

### 2. Tasks Screen (Main)
- Header with logout button
- Task list (FlatList)
  - Each task: title, description, checkbox (toggle complete), delete button
- "Add Task" floating button
- Pull-to-refresh
- Loading spinner
- Empty state message
- Error handling

### 3. Add/Edit Task Modal/Screen
- Title input (required)
- Description input (optional)
- Save button
- Cancel button
- Validation feedback

---

## Project Structure

**PNPM Monorepo** with two packages: `backend` and `mobile`

See [STRUCTURE.md](./STRUCTURE.md) for complete folder structure.

```
~/dev/assigments/rn/
├── packages/
│   ├── backend/              # Express API
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── config/database.ts
│   │   │   ├── middleware/auth.ts
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── utils/seed.ts
│   │   │   └── swagger.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── mobile/               # Expo React Native
│       ├── src/
│       │   ├── types.ts
│       │   ├── screens/
│       │   ├── services/api.ts
│       │   ├── navigation/
│       │   ├── components/
│       │   └── utils/storage.ts
│       ├── App.tsx
│       ├── app.json
│       └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json              # Root workspace scripts
└── README.md
```

---

## Implementation Phases

### Phase 1: Backend Setup (2.5 hours)
1. ✅ Create plan.md and STRUCTURE.md
2. Initialize backend package structure
3. Install dependencies
4. Create SQLite database schema
5. Build auth endpoints (register, login) with JWT
6. Build CRUD endpoints for tasks
7. Add JWT middleware
8. Setup Swagger docs
9. Create seed script
10. Write Dockerfile

### Phase 2: Frontend Setup (2 hours)
1. Initialize Expo project with TypeScript
2. Install navigation + dependencies
3. Create API service layer (ofetch)
4. Build Login screen
5. Build Tasks screen with CRUD
6. Implement token storage
7. Add loading/error states
8. Basic styling

### Phase 3: DevOps & Testing (1.5 hours)
1. Create docker-compose.yml
2. Write .env.example
3. Test full flow locally
4. Manual testing (register → login → CRUD)
5. Verify `docker compose up --build`

### Phase 4: Documentation (1 hour)
1. Write comprehensive README
2. Document API endpoints
3. Add APK build instructions
4. Note AI usage and approach
5. List possible improvements

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Backend starts via Docker
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] JWT token works for protected routes
- [ ] Can create task
- [ ] Can list tasks
- [ ] Can update task (toggle completion)
- [ ] Can delete task
- [ ] Swagger docs accessible
- [ ] Frontend connects to backend
- [ ] Login flow works
- [ ] Tasks CRUD works in UI
- [ ] Error handling displays properly
- [ ] APK builds successfully

---

## AI Usage Notes

### Tools Used
- **Cursor/GitHub Copilot**: Code completion, boilerplate generation
- **ChatGPT/Claude**: Architecture decisions, debugging assistance
- **AI Value**: 
  - Accelerated boilerplate setup (~40% time savings)
  - Quick TypeScript type generation
  - Swagger schema generation
  - Error handling patterns

### Where AI Helped
1. Express + TypeScript setup patterns
2. JWT middleware implementation
3. Swagger OpenAPI spec generation
4. React Navigation setup
5. ofetch error handling patterns
6. Docker configuration optimization

---

## Possible Improvements (Out of Scope)

### Backend
- [ ] PostgreSQL instead of SQLite
- [ ] Rate limiting
- [ ] Refresh token rotation
- [ ] Input validation with Zod/Joi
- [ ] Unit tests (Jest)
- [ ] Pagination for tasks
- [ ] Task filtering/sorting
- [ ] Role-based access control

### Frontend
- [ ] Offline support (local SQLite)
- [ ] Pull-to-refresh
- [ ] Optimistic updates
- [ ] Task categories/tags
- [ ] Search functionality
- [ ] Dark mode
- [ ] Animations
- [ ] Unit tests (Jest + React Native Testing Library)
- [ ] E2E tests (Detox)

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Environment-based configs
- [ ] Health check endpoints
- [ ] Logging (Winston/Pino)
- [ ] Monitoring (Sentry)

---

## Time Budget

| Task | Est. Time | Priority |
|------|-----------|----------|
| Backend auth + DB | 2h | High |
| Backend CRUD | 1h | High |
| Frontend screens | 2h | High |
| Docker + DevOps | 1h | High |
| Testing | 0.5h | High |
| Documentation | 0.5h | High |
| **Total** | **7h** | |

---

## Success Criteria

✅ Backend runs via `docker compose up --build`  
✅ Can register and login users  
✅ JWT authentication works  
✅ Full CRUD on tasks  
✅ Mobile app connects to API  
✅ Two screens (Login + Tasks)  
✅ Error handling implemented  
✅ Swagger docs accessible  
✅ README with setup instructions  
✅ APK build instructions included  
✅ .env.example provided  
✅ Clean code structure  
✅ TypeScript throughout  

---

## Getting Started

```bash
# Clone and setup
cd ~/dev/assigments/rn

# Install dependencies
pnpm install

# Start backend
docker compose up --build

# Start mobile (separate terminal)
cd packages/mobile
pnpm start

# Test credentials
Email: test@example.com
Password: password123
```

---

*Plan created: 2025-10-16*  
*Challenge: Roseberry Full-Stack Developer*  
*Target: 7 hours implementation*
