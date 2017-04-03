#!/usr/bin/env bash
# Developed by Anshul Jindal
# @email anshul.jindal@tum.de
# @github ansjin
cd ..
cd build/
echo java -mx5g -cp \"../stanford-corenlp-full-2016-10-31/\*";":.\"";" CorefResolve ../test/input.txt ../test/output.txt
java -mx5g -cp "../stanford-corenlp-full-2016-10-31/*;:."";" CorefResolve ../test/input.txt ../test/output.txt
read -p "Press [Enter] key to start backup..."