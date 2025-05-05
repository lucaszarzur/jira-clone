FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies with legacy peer deps to handle Angular 13's compatibility issues
RUN npm install --legacy-peer-deps

# Install webpack explicitly (needed for build)
RUN npm install --save-dev webpack webpack-cli webpack-dev-server

# Ensure Angular CLI is available globally
RUN npm install -g @angular/cli@13.2.5

# Install serve for static file serving
RUN npm install -g serve

# Copy source code
COPY . .

# Build the app with production configuration
RUN npm run build -- --configuration=production --aot

EXPOSE 80

# Serve the built app using serve
CMD ["serve", "-s", "dist", "-l", "80"] 