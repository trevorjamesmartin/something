#!/bin/sh

# faster than javascript

if [ -z "$1" ]; then echo "knexfile ?" && exit; fi

grep development -C 7 $1 | \
grep filename | \
xargs -- | \
awk '{print $2}'| \
grep -Po '^.{3}\K.*' | \
sed s/.$//
