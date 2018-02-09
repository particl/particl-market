#!/bin/sh
curl -d "{\"content\": \"$1\", \"username\": \"$2\"}" -H 'Content-Type: application/json' -X POST $3
