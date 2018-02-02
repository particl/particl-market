#!/bin/sh
kontena stack rm --force dappshellmaster-stack
sleep 5
kontena stack install kontena-master.yml; kontena stack logs -t dappshellmaster-stack
