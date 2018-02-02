#!/bin/sh
kontena stack rm --force dappshelldev-stack
sleep 5
kontena stack install kontena-develop.yml; kontena stack logs -t dappshelldev-stack
