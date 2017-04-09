#!/bin/sh
docker rm $(docker ps -a -q)
docker rmi musicconnectionmachine/relationships-openie-washington
read -p "Press [Enter] key to End..."