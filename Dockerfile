# Pinned base image reference as approved by task specifications
FROM node:20

# Setting allowed directory destination
WORKDIR /app

# Lockfile-driven package install
COPY package.json package-lock.json ./
RUN npm ci

# Copy entire repository including .git history for setup fixtures
COPY . .

# Build Next.js project
RUN npm run build

# Expose port and start Next.js application
EXPOSE 3000
CMD ["npm", "run", "start"]
