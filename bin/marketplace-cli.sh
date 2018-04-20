#!/bin/bash
set -e

#!/bin/bash

# TODO: login/pass from config?

if (( $# == 0 )); then
    echo "usage: port command params..."
    echo ""
    echo "example: marketplace-cli.sh 3000 help"
    exit
elif (( $# == 1 )); then
    PORT="$1"
    HOST="http://localhost:$PORT/api/rpc"
    shift
    # echo ">>> docker-compose exec $SERVICE /opt/particl-0.16/bin/particl-cli help"
    echo -e $(curl -s --user test:test \
    -H "Accept: application/json" \
    -H "Content-Type:application/json" \
    -X POST --data "{\"method\":\"help\",\"params\":[],\"id\":1,\"jsonrpc\":\"2.0\"}" "${HOST}" | jq '.result' )

# todo: remove quotes, jq with raw output but somehow preserving newlines

else
    PORT="$1"
    HOST="http://localhost:$PORT/api/rpc"
    RPCCOMMAND="$2"
    shift
    shift
    echo "RPCCOMMAND: $RPCCOMMAND"
    echo "@: $@"
    PARAMS="$@"

    echo -e $(curl -s --user test:test \
    -H "Accept: application/json" \
    -H "Content-Type:application/json" \
    -X POST --data "{\"method\":\"${RPCCOMMAND}\",\"params\":[${PARAMS}],\"id\":1,\"jsonrpc\":\"2.0\"}" "${HOST}" | jq '.result' )
    #| python -m json.tool

# todo: support for more than one param

fi

