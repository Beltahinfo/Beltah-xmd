# Use the official Node.js LTS Buster image as base
FROM node:lts-buster

# Set working directory (optional, but common practice)
WORKDIR /app

# Update package sources to use the Debian archive (Buster repositories have moved)
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list \
 && sed -i '/security/d' /etc/apt/sources.list \
 && apt-get -o Acquire::Check-Valid-Until=false update \
 && apt-get -o Acquire::Check-Valid-Until=false install -y ffmpeg imagemagick webp \
 && apt-get -o Acquire::Check-Valid-Until=false upgrade -y \
 && npm i pm2 -g \
 && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose port (replace 3000 with your app's port if different)
EXPOSE 3000

# Start the app using pm2-runtime (recommended for Docker)
# Replace "ecosystem.config.js" with your actual PM2 config or entry point file if needed
CMD ["pm2-runtime", "start", "beltahinfo.js"]
