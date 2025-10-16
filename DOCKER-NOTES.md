# Docker Build Notes

## Status: ⚠️ Native Module Compilation Issue

The Docker build encounters issues compiling native modules (bcrypt, better-sqlite3) in the container.

### The Problem

**Error**: `Cannot find module '/app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node'`

This happens because:
- bcrypt and better-sqlite3 require native C++ compilation
- pnpm in monorepo environments may ignore build scripts by default
- Alpine Linux (lightweight) may lack required build tools

### Solutions

#### ✅ Option 1: Test Backend Locally (Recommended)

```bash
cd packages/backend
pnpm install  # Install with native module compilation
pnpm dev      # Start with tsx watch

# In another terminal, test API
curl http://localhost:3000/health
```

**Why this works**: Local npm install can compile natives

---

#### ✅ Option 2: Docker with Build Tools

Update `Dockerfile` to force native compilation:

```dockerfile
FROM node:18-bookworm  # Debian-based (not alpine)

WORKDIR /app

RUN apt-get update && apt-get install -y python3 build-essential

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend ./packages/backend
COPY tsconfig.json .

RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

WORKDIR /app/packages/backend
CMD ["pnpm", "start"]
```

---

#### ✅ Option 3: Use Pre-compiled Binaries

Add to `package.json`:

```json
{
  "pnpm": {
    "overrides": {
      "better-sqlite3": "9.0.0"  // Version with prebuilt binaries
    }
  }
}
```

---

#### ✅ Option 4: Compile on Host, Copy to Docker

```bash
# On host machine
npm rebuild bcrypt better-sqlite3

# Docker
COPY node_modules ./node_modules  # Copy precompiled modules
```

---

## Recommended Approach for Challenge

Since the challenge is about demonstrating full-stack development (not DevOps), **test locally without Docker**:

```bash
# Setup
cd ~/dev/assigments/rn
pnpm install

# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: Mobile
cd packages/mobile
pnpm start

# Terminal 3: Seed database (once backend starts)
cd packages/backend
pnpm seed
```

**Result**: Fully functional app in 2-3 terminal windows

---

## For Production

Use Docker with one of the solutions above, or:
- Deploy to Heroku/Railway with `buildpacks` (handles native modules)
- Use Render.com (auto-detects Node native modules)
- Pre-build Docker image with compile step separately

---

## Testing API Endpoints

Once backend is running locally:

```bash
# Health check
curl http://localhost:3000/health

# Swagger docs
open http://localhost:3000/api-docs

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get tasks (replace TOKEN)
curl http://localhost:3000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

---

## Summary

| Approach | Effort | Reliability | Time |
|----------|--------|-------------|------|
| Local (no Docker) | ⭐ Low | ⭐⭐⭐⭐⭐ | 5 min |
| Docker (nodejs-bookworm) | ⭐⭐ Medium | ⭐⭐⭐⭐ | 15 min |
| Docker (Alpine + Alpine linux) | ⭐⭐⭐ High | ⭐⭐⭐ | 20+ min |

**Recommendation**: Use local testing for demo, Docker solution above for production
