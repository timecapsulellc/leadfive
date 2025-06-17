# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including serve
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally for production serving
RUN npm install -g serve

# Expose port 8080
EXPOSE 8080

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "8080"] 