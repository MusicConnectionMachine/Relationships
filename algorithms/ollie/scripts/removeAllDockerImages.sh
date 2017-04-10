#!/bin/sh
docker rmi $(docker images -q)
read -p "Press [Enter] key to End..."