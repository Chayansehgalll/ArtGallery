FROM node:20-alpine

# Install essential native binary build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install clean dependency listings
RUN npm install

# Generate internal Prisma client types
COPY prisma ./prisma/
RUN npx prisma generate

# Copy codebase assets
COPY . .

# Compile TypeScript down into native ES Modules JavaScript (dist/)
RUN npm run build

# Strip devDependencies to ensure an ultra-lean production image
RUN npm prune --production

# Expose internal port architecture
EXPOSE 8080

# Inject fixed deployment runtime variables
ENV PORT=8080
ENV NODE_ENV=production

# Boot via npm directly (npm automatically maps the prestart migrations!)
CMD ["npm", "run", "start"]