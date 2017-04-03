#!/usr/bin/env bash
# Developed by Anshul Jindal
# @email anshul.jindal@tum.de
# @github ansjin
cd ../src
javac -cp "../stanford-corenlp-full-2016-10-31/*" -d ../build CorefResolve.java
cd ..
cd build/
jar cvf CorefResolve.jar *
echo "Jar File Built... Check inside build folder"
read -p "Press [Enter] key to exit..."