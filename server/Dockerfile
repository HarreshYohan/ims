# Use an official Node.js runtime as a parent image
FROM docker.io/library/node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle your app source code inside the Docker image
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app using CMD which runs at container startup
CMD ["node", "server.js"]
