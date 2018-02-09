#!/bin/sh
echo "1: $1"
echo "2: $2"
echo "3: $3"
curl -d "{\"content\": \"$1\", \"username\": \"$2\"}" -H 'Content-Type: application/json' -X POST $3
