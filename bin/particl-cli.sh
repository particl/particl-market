#!/bin/bash
if (( $# == 0 )); then
    echo "usage: service command params..."
    echo ""
    echo "example: particl-cli.sh particld1 help"
    exit
elif (( $# == 1 )); then
    SERVICE="$1"
    shift
    echo ">>> docker-compose exec $SERVICE /opt/particl/bin/particl-cli -rpcwallet=particl-market help"
    docker-compose exec "$SERVICE" /opt/particl/bin/particl-cli -rpcwallet=profiles/DEFAULT/particl-market help
else
    SERVICE="$1"
    shift
    echo ">>> docker-compose exec $SERVICE /opt/particl/bin/particl-cli -rpcwallet=particl-market $@"
    docker-compose exec "$SERVICE" /opt/particl/bin/particl-cli -rpcwallet=profiles/DEFAULT/particl-market "$@"
fi

