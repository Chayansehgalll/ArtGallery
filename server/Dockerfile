# 1. Use an official Node runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package configuration files from both the root and server folders
COPY package*.json ./
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# 4. Install all global and local dependencies
RUN npm install
RUN cd server && npm install

# 5. Copy the rest of the application files
COPY . .

# 6. Build the server environment
WORKDIR /app/server
RUN npx prisma generate
RUN npx -p typescript tsc --skipLibCheck

# 7. Expose the port the app runs on
EXPOSE 8080

# 8. Run migrations and start the application
CMD npx prisma migrate deploy && npm run start