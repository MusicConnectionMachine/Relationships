#!/usr/bin/env bash
# Developed by Anshul Jindal
# @email anshul.jindal@tum.de
# @github ansjin
cd ../src
echo javac -cp \"../stanford-corenlp-full-2016-10-31/*\" -d ../build CorefResolve.java
javac -cp "../stanford-corenlp-full-2016-10-31/*" -d ../build CorefResolve.java
cd ..
cd build/
echo java -mx5g -cp \"./stanford-corenlp-full-2016-10-31/\*";":.\"";" CorefResolve ../example/input.txt ../example/output.txt
java -mx5g -cp "../stanford-corenlp-full-2016-10-31/*;:."";" CorefResolve ../example/input.txt ../example/output.txt

read -p "Press [Enter] key to exit..."