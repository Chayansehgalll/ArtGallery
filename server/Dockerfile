FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm install \
cloudinary \
express-rate-limit \
express \
cors \
helmet \
morgan \
compression \
cookie-parser \
jsonwebtoken \
bcryptjs \
zod \
multer \
nodemailer \
@prisma/client

RUN npm install -D \
typescript \
@types/node \
@types/express \
@types/cors \
@types/compression \
@types/cookie-parser \
@types/jsonwebtoken \
@types/bcryptjs \
@types/morgan \
@types/multer \
@types/nodemailer

RUN npx prisma generate

RUN npx tsc

EXPOSE 8080

CMD npx prisma migrate deploy && npm run start