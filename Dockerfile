# Build Stage
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies for the monorepo
# npm ci is faster and improved for CI environments
RUN npm ci

# Build all packages in the monorepo
RUN npm run build

# Build the playground application
WORKDIR /app/playground
# Install playground specific dependencies
RUN npm ci
# Build the playground
RUN npm run build

# Production Stage
FROM node:20-slim

WORKDIR /app

# Install 'serve' to serve static assets
RUN npm install -g serve

# Copy the built assets from the builder stage
COPY --from=builder /app/playground/dist .

# Bind to the standard port or the one provided by Render ($PORT)
ENV PORT=3000
EXPOSE 3000

# Start the static file server
CMD ["sh", "-c", "serve -s . -l ${PORT}"]
