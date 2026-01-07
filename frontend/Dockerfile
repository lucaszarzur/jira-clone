# This is the default Dockerfile used for development
# For production, use Dockerfile.prod

# Build stage
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./

# Install dependencies with legacy peer deps to handle Angular 13's compatibility issues
RUN npm install --legacy-peer-deps

# Install webpack explicitly (needed for build)
RUN npm install --save-dev webpack webpack-cli webpack-dev-server

# Ensure Angular CLI is available globally
RUN npm install -g @angular/cli@13.2.5

# Copy source code
COPY . .

# Build the app with production configuration
RUN npm run build -- --configuration=production --aot

# Development stage with Nginx for local development
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]