#!/bin/sh
wait-port $APP_HOST:$APP_PORT/cli
npm run test:ui:pretty
