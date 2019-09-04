#!/bin/sh
set -e

yarn install --check-files
npm run docs
