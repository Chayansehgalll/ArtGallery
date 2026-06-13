FROM node:20-alpine

# Install native compilation requirements for tools like bcrypt
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy dependency mappings
COPY package*.json ./

# Install all dependencies (production + development types needed for tsc build)
RUN npm install

# Pre-generate Prisma client bindings
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the backend repository files
COPY . .

# Compile TypeScript to JavaScript (generates the dist/ folder)
RUN npm run build

# Prune development typing files to keep the container fast and secure
RUN npm prune --production

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

# Safely run pending migrations and boot up the Express server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]