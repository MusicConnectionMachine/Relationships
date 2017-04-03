#!/bin/sh
echo "Deploying the Relationship"
cd ..
echo "Step 1: Building Docker Image"
docker build -t relationship .
echo "Step 2: Running Docker Image"
(docker run relationship)&
read -p "Press enter to continue"
