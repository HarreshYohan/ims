# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Working directory — must match docker-compose volume mount
WORKDIR /usr/src/app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose app port (reads from env, defaults to 8083)
EXPOSE 8083

# Start with nodemon for hot-reload in development
CMD ["npm", "run", "dev"]
