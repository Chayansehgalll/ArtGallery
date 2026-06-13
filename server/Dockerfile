FROM node:20-alpine

# Install native building requirements for system utilities
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install clean dependency lists
RUN npm install

# Build Prisma bindings
COPY prisma ./prisma/
RUN npx prisma generate

# Copy codebase assets
COPY . .

# Compile TypeScript down to the build target folder (dist/)
RUN npm run build

# Strip dev-dependencies out of the production container image
RUN npm prune --production

# Inform Back4App framework of target internal ports
EXPOSE 8080

# Inject required orchestration variables
ENV PORT=8080
ENV NODE_ENV=production

# Safely apply outstanding database migrations, then execute the JS output file
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]