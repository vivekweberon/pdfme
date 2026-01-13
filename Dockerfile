# Build Stage
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies for the monorepo
RUN npm ci

# Build all packages in the monorepo
RUN npm run build

# Build the playground application
WORKDIR /app/playground
RUN npm ci
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Copy necessary artifacts from builder
# We need the root package.json, node_modules (with dependencies), packages (for local references), and the server code.
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/server ./server
COPY --from=builder /app/playground/dist ./playground/dist

# Bind to port
ENV PORT=3000
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server/index.js"]
