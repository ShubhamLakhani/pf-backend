# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy all of your application code to the container
COPY . .

# Install dependencies, Build the NestJS application, and do cleanup
RUN npm install && \
    npm run build && \
    npm cache clean --force

# Envs are added at last as nest build used the envs during runtime unlike react which uses it at buildtime
ARG PORT
RUN sh -c 'echo "PORT=${PORT}" >> .env'
ARG ENV
RUN sh -c 'echo "ENV=${ENV}" >> .env'
ARG MONGO_URI
RUN sh -c 'echo "MONGO_URI=${MONGO_URI}" >> .env'
ARG ALLOWED_ORIGINS
RUN sh -c 'echo "ALLOWED_ORIGINS=${ALLOWED_ORIGINS}" >> .env'
ARG JWT_SECRET
RUN sh -c 'echo "JWT_SECRET=${JWT_SECRET}" >> .env'
ARG JWT_EXPIRY
RUN sh -c 'echo "JWT_EXPIRY=${JWT_EXPIRY}" >> .env'
ARG ADMIN_DATA
RUN sh -c 'echo "ADMIN_DATA=${ADMIN_DATA}" >> .env'
ARG AWS_ACCESS_KEY_ID
RUN sh -c 'echo "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" >> .env'
ARG AWS_SECRET_ACCESS_KEY
RUN sh -c 'echo "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" >> .env'
ARG AWS_REGION
RUN sh -c 'echo "AWS_REGION=${AWS_REGION}" >> .env'
ARG AWS_BUCKET_NAME
RUN sh -c 'echo "AWS_BUCKET_NAME=${AWS_BUCKET_NAME}" >> .env'

# Expose the port that your NestJS app runs on
EXPOSE 4000

# Define the command to run your app
CMD ["npm", "run", "start:prod"]
