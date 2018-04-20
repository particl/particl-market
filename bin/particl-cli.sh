#!/bin/bash
if (( $# == 0 )); then
    echo "usage: service command params..."
    echo ""
    echo "example: particl-cli.sh particld1 help"
    exit
elif (( $# == 1 )); then
    SERVICE="$1"
    shift
    echo ">>> docker-compose exec $SERVICE /opt/particl-0.16/bin/particl-cli help"
    docker-compose exec "$SERVICE" /opt/particl-0.16/bin/particl-cli help
else
    SERVICE="$1"
    shift
    echo ">>> docker-compose exec $SERVICE /opt/particl-0.16/bin/particl-cli $@"
    docker-compose exec "$SERVICE" /opt/particl-0.16/bin/particl-cli "$@"
fi

