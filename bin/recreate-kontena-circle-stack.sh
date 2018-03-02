#!/bin/sh
kontena stack rm --force dappshellcircle-stack
sleep 5
kontena stack install kontena-circle.yml; kontena stack logs -f dappshellcircle-stack
