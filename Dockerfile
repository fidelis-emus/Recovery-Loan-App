# Multi-stage production build configuration for Loan Intelligence Middleware Core
# STAGE 1: Build the client & compile the server CJS output
FROM node:20-alpine AS builder
WORKDIR /app

# Install compilation prerequisites
COPY package*.json ./
RUN npm ci

# Copy full repository content
COPY . .

# Compile Web application production assets and Server bundle
RUN npm run build

# STAGE 2: Lightweight runtime environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary package specifications and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles from builder stage
COPY --from=builder /app/dist ./dist

# Expose default ingress port
EXPOSE 3000

# Start compiled CJS production application
CMD ["node", "dist/server.cjs"]
