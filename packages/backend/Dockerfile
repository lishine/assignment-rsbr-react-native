FROM node:18

WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package
COPY packages/backend ./packages/backend

# Copy workspace config
COPY tsconfig.json .

RUN npm install -g pnpm
RUN cd /app && pnpm install --frozen-lockfile

EXPOSE 3000

WORKDIR /app/packages/backend

# Note: Run 'pnpm seed' separately after container starts
CMD ["pnpm", "start"]
