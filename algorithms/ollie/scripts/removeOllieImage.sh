#!/bin/sh
docker rm $(docker ps -a -q)
docker rmi musicconnectionmachine/ollie
read -p "Press [Enter] key to End..."