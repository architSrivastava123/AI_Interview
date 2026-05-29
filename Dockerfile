# ==========================================
# STAGE 1: Compilation and Build (Node 20)
# ==========================================
FROM node:20 AS builder
WORKDIR /app

# COPY #1: Copy entire source including lockfiles to the compilation container
COPY . /app/

# Lockfile-driven clean installation and Next.js production build
RUN npm ci && npm run build

# ==========================================
# STAGE 2: Hardened Alpine Runner (Lightweight)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set container environment flags
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create low-privilege user and group for container isolation
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY #2: Copy the entire built application from the builder stage
COPY --from=builder /app /app

# Execute container under non-root permissions
USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
