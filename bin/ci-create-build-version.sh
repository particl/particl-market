#!/bin/sh
VERSION="$(git log -n 1 --date=short --format=format:"rev.%ad.%h" HEAD)"
echo "{\n\t\"version\": \"$VERSION\"\n}" > public/cli/build.json
