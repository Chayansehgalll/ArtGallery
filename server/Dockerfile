FROM node:20-alpine

# Install build essentials required for native dependency compilations (like bcrypt)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy dependency manifests first to leverage Docker caching layers
COPY package*.json ./

# Install ALL production and development dependencies directly from package.json
RUN npm ci

# Copy Prisma files and generate client bindings before copying the main source code
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Compile TypeScript code into your production build (dist/) folder
RUN npm run build

# Clear development dependencies to make the container light and fast
RUN npm prune --production

# Expose the correct port matching Back4App load balancer health checks
EXPOSE 8080

# Environment optimization variables
ENV PORT=8080
ENV NODE_ENV=production

# Clean execution form running database migrations safely before launching the service
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]