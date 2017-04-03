#!/bin/sh
echo "Deploying the dateEventExtraction Algorithm in seprate container"
cd ..
echo "Step 1: Building Docker Image"
docker build -t dateEventExtraction .
echo "Step 2: Running Docker Image"
(docker run -p 3003:3003 dateEventExtraction)&
read -p "Press enter to continue"
