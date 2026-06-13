# 1. Use an official Node runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package configuration files
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your server code
COPY . .

# 6. Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# 7. Expose the port the app runs on
EXPOSE 8080

# 8. Run migrations and start the application
CMD npx prisma migrate deploy && npm run start