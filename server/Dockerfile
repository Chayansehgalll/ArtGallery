# 1. Use an official Node runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package configuration files (locally, since server is the root directory)
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install all server-side dependencies
RUN npm install

# 5. Copy the rest of the server files
COPY . .

# 6. Generate Prisma client and compile TypeScript with standard safety flags
RUN npx prisma generate
RUN npx -p typescript tsc --skipLibCheck

# 7. Expose the port the app runs on
EXPOSE 8080

# 8. Run migrations and start the application
CMD npx prisma migrate deploy && npm run start