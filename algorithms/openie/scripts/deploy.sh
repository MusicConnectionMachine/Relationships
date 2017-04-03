#!/bin/sh
echo "Deploying the openie Algorithm in seprate container"
cd ..
echo "Step 1: Building Docker Image"
docker build -t openie .
echo "Step 2: Running Docker Image"
(docker run -p 3001:3001 openie)&
read -p "Press enter to continue"