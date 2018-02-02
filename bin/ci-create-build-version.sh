#!/bin/sh
git log -n 1 --date=short --format=format:"rev.%ad.%h" HEAD > public/cli/build
