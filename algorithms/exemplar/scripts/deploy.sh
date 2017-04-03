#!/bin/sh
echo "Deploying the exemplar Algorithm in seprate container"
cd ..
echo "Step 1: Building Docker Image"
docker build -t exemplar .
echo "Step 2: Running Docker Image"
(docker run -p 3002:3002 exemplar)&
read -p "Press enter to continue"
