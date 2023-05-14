# Use node:alpine as base image
FROM node:18.12.1-alpine

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies in the Docker container
RUN npm install

# Copy the rest of the code to the working directory
COPY . .

# Expose port 3000 to be accessed from outside the Docker container
EXPOSE 3000

# The command to run the application
CMD [ "node", "app.js" ]
