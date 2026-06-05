# Use stable lightweight Node image
FROM node:20-alpine

# Set node environment
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm install --only=production

# Copy remaining source code
COPY . .

# Run as non-root user for security
USER node

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
