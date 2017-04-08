#!/bin/sh
docker rm $(docker ps -a -q)
read -p "Press [Enter] key to End..."