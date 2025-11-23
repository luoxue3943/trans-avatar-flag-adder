# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Enable corepack for pnpm support
RUN corepack enable

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
# Note: If you encounter network issues during build, you can alternatively use npm:
# COPY package.json package-lock.json* ./
# RUN npm ci --frozen-lockfile
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack for pnpm support
RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
