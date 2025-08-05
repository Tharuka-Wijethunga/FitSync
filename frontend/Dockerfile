# Use an official Node.js runtime
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Command to run the dev server. The --host flag is crucial for Docker.
CMD ["npm", "run", "dev", "--", "--host"]