#!/bin/sh
echo "Deploying the ollie Algorithm in seprate container"
cd ..
echo "Step 1: Building Docker Image"
docker build -t ollie .
echo "Step 2: Running Docker Image"
(docker run -p 3000:3000 ollie)&
read -p "Press enter to continue"