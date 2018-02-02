#!/bin/sh
kontena stack rm --force dappshellfeature-stack
sleep 5
kontena stack install kontena-feature.yml; kontena stack logs -t dappshellfeature-stack
