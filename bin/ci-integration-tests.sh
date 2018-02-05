#!/bin/sh
wait-port dappshell:3100
npm run test:integration:pretty
