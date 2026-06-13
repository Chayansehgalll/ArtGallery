# 1. Use an official Node runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package configuration files
COPY package*.json ./
COPY prisma ./prisma/

# 4. Install production dependencies and explicitly bundle missing modules
RUN npm install
RUN npm install express cors helmet morgan compression cookie-parser jsonwebtoken bcryptjs zod @types/node @types/express @types/cors @types/compression @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/morgan multer @types/multer nodemailer @types/nodemailer

# 5. Copy the rest of your server code
COPY . .

# 6. Generate Prisma client and compile the application cleanly
RUN npx prisma generate
RUN npx -p typescript tsc

# 7. Expose the port the app runs on
EXPOSE 8080

# 8. Run migrations and start the application
CMD npx prisma migrate deploy && npm run start