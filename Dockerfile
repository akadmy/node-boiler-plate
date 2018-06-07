# Get the latest node image
FROM node:latest

# Create a folder to hold the code for your app
RUN mkdir -p /usr/src/app

# Change the directory to your application folder
WORKDIR /usr/src/app

# Copy package.json to your working container
COPY package.json /usr/src/app/

# Install node dependencies
RUN npm install

# Copy the source code
COPY . /usr/src/app

# Expose the port
EXPOSE 3000 27017

# Start the node server
CMD [ "npm", "start" ]