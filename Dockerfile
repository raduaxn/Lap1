# Use the official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]

#------------MongoDB-------------------------------------------------------
## Use Node 18 image
#FROM node:18
#
## Set the working directory in the container
#WORKDIR /app
#
## Copy package.json and package-lock.json to install dependencies
#COPY package*.json ./
#
## Install dependencies (including mongoose)
#RUN npm install
#
## Copy the rest of the application files to the container
#COPY . .
#
## Expose port 3000 for the server
#EXPOSE 3000
#
## Start the server
#CMD ["npm", "start"]
#