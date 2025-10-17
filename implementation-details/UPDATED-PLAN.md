# PostgreSQL Migration Plan

## Problem
The current setup uses `better-sqlite3` which requires native bindings compilation. This fails in Docker on ARM64 architecture with the error:
```
Error: Could not locate the bindings file
```

## Solution
1. Migrate from SQLite to PostgreSQL (production-ready, uses pure JS driver `pg`)
2. Replace `bcrypt` with Node.js built-in `crypto` module (no native bindings needed)

## Changes Required

### 1. Docker Compose
Add PostgreSQL service and update backend environment variables:
```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: task-db
    environment:
      POSTGRES_USER: taskapp
      POSTGRES_PASSWORD: taskapp_password
      POSTGRES_DB: taskapp
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U taskapp"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://taskapp:taskapp_password@postgres:5432/taskapp

volumes:
  postgres_data:
```

### 2. Backend Dependencies
Replace in `packages/backend/package.json`:
```diff
- "better-sqlite3": "^9.2.2",
- "@types/better-sqlite3": "^7.6.8",
- "bcrypt": "^5.1.1",
- "@types/bcrypt": "^5.0.2",
+ "pg": "^8.11.3",
+ "@types/pg": "^8.11.0",
```

Note: Node.js built-in `crypto` module replaces bcrypt (no additional dependencies needed).

### 3. Database Module
Update `packages/backend/src/config/database.ts`:
- Replace `Database` from better-sqlite3 with `Pool` from pg
- Convert synchronous SQLite queries to async PostgreSQL queries
- Update schema syntax:
  - `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
  - `INTEGER DEFAULT 0` → `BOOLEAN DEFAULT false`
  - `DATETIME` → `TIMESTAMP`
  - `CURRENT_TIMESTAMP` remains the same
- Use parameterized queries with `$1, $2` instead of `?`

### 4. Schema Changes
PostgreSQL schema:
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Query Changes
All database functions need to be converted to async:
- `getUserByEmail()` → `async getUserByEmail()`
- `createUser()` → `async createUser()`
- `getTasksByUserId()` → `async getTasksByUserId()`
- etc.

### 6. Controller Updates
All route handlers must be updated to await database calls:
```diff
- const user = getUserByEmail(email);
+ const user = await getUserByEmail(email);
```

## Benefits of This Approach

### PostgreSQL
1. **No Native Bindings**: Pure JavaScript driver, works in any Docker environment
2. **Production Ready**: Industry standard, better for scaling
3. **Better Concurrency**: Handles multiple connections efficiently
4. **Rich Features**: JSON support, full-text search, etc.
5. **Standard SQL**: More portable, widely known syntax

### Node.js Built-in Crypto
1. **No Dependencies**: Built into Node.js, no npm packages needed
2. **No Native Bindings**: Pure JavaScript, no compilation required
3. **Secure**: Uses scrypt algorithm, recommended for password hashing
4. **Lightweight**: Smaller Docker images, faster builds
5. **Reliable**: Part of Node.js core, well-maintained

## Migration Steps

1. ✅ Create UPDATED-PLAN.md
2. Update docker-compose.yml with PostgreSQL service
3. Update backend/package.json dependencies
4. Rewrite database.ts for PostgreSQL
5. Update all controllers to use async/await
6. Run `pnpm install` to update dependencies
7. Test `docker compose up --build`

## Testing Checklist

- [ ] PostgreSQL container starts successfully
- [ ] Backend connects to PostgreSQL
- [ ] Schema initializes correctly
- [ ] Seed data works
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] Tasks CRUD operations work
- [ ] JWT authentication works
- [ ] Swagger docs accessible

## Rollback Plan

If issues occur, revert to SQLite by:
1. Restore original docker-compose.yml
2. Restore original package.json
3. Restore original database.ts
4. Run `pnpm install`

## Time Estimate

- Setup: 15 minutes
- Code changes: 30 minutes
- Testing: 15 minutes
- **Total**: ~1 hour
