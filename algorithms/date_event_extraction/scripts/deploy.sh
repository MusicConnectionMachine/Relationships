#!/bin/sh
echo "Deploying the dateEventExtraction Algorithm in seprate container"
cd ..
echo "Step 1: Building and Running Docker Image"
docker-compose up --build
read -p "Press [Enter] key to End..."
