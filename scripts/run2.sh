#!/bin/sh
echo "Deploying the Relationship"
cd ..
echo "Step 1: Building and Running Docker Image"
(docker-compose up)&
read -p "Press enter to continue"
