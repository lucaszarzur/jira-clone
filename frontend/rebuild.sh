#!/bin/bash

# Script para reconstruir e reiniciar apenas o contêiner frontend

echo "Parando contêiner frontend..."
docker-compose stop frontend

echo "Removendo contêiner frontend..."
docker-compose rm -f frontend

echo "Reconstruindo imagem frontend..."
docker-compose build frontend

echo "Iniciando contêiner frontend..."
docker-compose up -d frontend

echo "Exibindo logs..."
docker-compose logs -f frontend 