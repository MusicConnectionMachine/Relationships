#!/bin/sh
docker rm $(docker ps -a -q)
docker rmi musicconnectionmachine/relationships-dateevent
read -p "Press [Enter] key to End..."