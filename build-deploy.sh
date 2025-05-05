#!/bin/bash

# Script to build and deploy Docker containers for Jira Clone application

# Function to display help message
show_help() {
    echo "Usage: ./build-deploy.sh [option]"
    echo "Options:"
    echo "  dev       - Build and start development environment"
    echo "  prod      - Build and start production environment"
    echo "  clean     - Remove containers, images, and volumes"
    echo "  help      - Show this help message"
}

# Function to handle development environment
dev_env() {
    echo "Building and starting development environment..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.dev.yml up
}

# Function to handle production environment
prod_env() {
    echo "Building and starting production environment..."
    docker-compose down
    docker-compose build
    docker-compose up
}

# Function to clean Docker artifacts
clean_env() {
    echo "Cleaning Docker containers, images, and volumes..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    
    echo "Removing containers..."
    docker rm $(docker ps -a -q -f name=jira-clone) 2>/dev/null || true
    
    echo "Removing images..."
    docker rmi $(docker images -q -f reference='*jira-clone*') 2>/dev/null || true
    
    echo "Docker environment cleaned."
}

# Main script logic
case "$1" in
    dev)
        dev_env
        ;;
    prod)
        prod_env
        ;;
    clean)
        clean_env
        ;;
    help|*)
        show_help
        ;;
esac 