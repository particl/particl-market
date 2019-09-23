// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger } from './Logger';
import { Core, Types } from '../constants';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';
import * as ParticlZmq from 'particl-zmq';

export class ZmqWorker {

    public zmq: ParticlZmq;

    private log = new Logger(__filename);
    private eventEmitter;

    constructor(ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.eventEmitter.setMaxListeners(10);
        this.zmq = this.configure();
    }

    public emit(eventType: string, msg: string): void {
        // this.clientSocket.emit(eventType, msg);
    }

    private configure(): ParticlZmq {
        this.log.debug('Configuring ZmqWorker');

        const host = (process.env.RPCHOSTNAME ? process.env.RPCHOSTNAME : '127.0.0.1');
        const port = (process.env.ZMQ_PORT ? process.env.ZMQ_PORT : 54235);
        const addr = 'tcp://' + host + ':' + port;
        this.log.debug('ZMQ: addr: ', addr);

        const opts = {
            maxRetry: 10000
        };

        const particld = new ParticlZmq({
            // hashtx: addr,
            hashblock: addr,
            // rawtx: addr,
            // rawblock: addr,
            smsg: addr
        }, opts);

        particld.connect();

        particld.on('smsg', (msgid) => {
            this.log.debug('ZMQ: receive(smsg): ', msgid.toString('hex'));
        });

        particld.on('hashblock', (hash) => {
            this.log.debug('ZMQ: receive(hashblock): ', hash.toString('hex'));
        });

        particld.on('hashtx', (hash) => {
            this.log.debug('ZMQ: receive(hashtx): ', hash.toString('hex'));
        });

        particld.on('rawblock', (block) => {
            this.log.debug('ZMQ: receive(rawblock): ', block.toString('hex'));
        });

        particld.on('rawtx', (tx) => {
            this.log.debug('ZMQ: receive(rawtx): ', tx.toString('hex'));
        });

        particld.on('connect:*', (uri, type) => {
            this.log.debug('ZMQ: connect:* ' + type + ', uri: ' + uri);
        });

        particld.on('close:*', (err, type) => {
            this.log.debug('ZMQ: close:* ' + type + ', error: ' + err);
        });

        particld.on('retry:*', (type, attempt) => {
            this.log.debug('ZMQ: retry:* ' + type + ', attempt: ' + attempt);
        });

        particld.on('error:*', (err, type) => {
            this.log.debug('ZMQ: error:* ' + type + ', error: ' + err);
        });

        this.log.debug('ZMQ: CONFIGURED!');

        // TODO: .env

        // this.receiver(socket);
        return particld;
    }

/*
    private receiver(clientSocket: zmq.Socket): void {
        if (!clientSocket.closed) {
            setTimeout(async () => {
                const [msg] = await this.clientSocket.receive();
                this.log.debug('receive(): ', msg.toString());
                this.receiver(clientSocket);
            }, 100);
        } else {
            setTimeout(async () => {
                this.log.debug('receive(): clientSocket.closed');
                this.receiver(clientSocket);
            }, 1000);
        }
    }
*/
}
