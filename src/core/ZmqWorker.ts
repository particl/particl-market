// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger } from './Logger';
import { Core, Targets, Types } from '../constants';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';
import * as ParticlZmq from 'particl-zmq';
import { CoreMessageProcessor } from '../api/messageprocessors/CoreMessageProcessor';
import * as Queue from '@ronomon/queue';

export class ZmqWorker {

    public zmq: ParticlZmq;

    private log = new Logger(__filename);
    private eventEmitter: EventEmitter;
    private coreMessageProcessor: CoreMessageProcessor;
    private isConnected = false;
    private queue;
    private queueWorkerCount = 5;

    constructor(ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.eventEmitter.setMaxListeners(10);
        this.coreMessageProcessor = ioc.container.getNamed<CoreMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.CoreMessageProcessor);
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

        particld.on('smsg', async (msgid) => {
            this.log.debug('ZMQ: receive(smsg): ', msgid.toString('hex'));
            msgid = msgid.toString('hex').slice(4); // 4 first ones are the msg version
            if (this.queue !== undefined) {
                this.queue.push(msgid);
            }
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
            this.queue = new Queue(this.queueWorkerCount);
            this.queue.onData = async (msgid, end) => {
                await this.coreMessageProcessor.process(msgid)
                    .catch(() => this.log.error('Failed to process msgid: ', + msgid))
                    .then(() => end());
            };

            this.isConnected = true;
            this.log.debug('ZMQ: connect:* ' + type + ', uri: ' + uri);
        });

        particld.on('close:*', (err, type) => {
            if (this.isConnected) {
                this.log.debug('ZMQ: close:* ' + type + ', error: ' + err);
            }
            this.isConnected = false;
            this.queue.stop();
            this.queue = undefined;
        });

        particld.on('retry:*', (type, attempt) => {
            // this.log.debug('ZMQ: retry:* ' + type + ', attempt: ' + attempt);
        });

        particld.on('error:*', (err, type) => {
            this.log.debug('ZMQ: error:* ' + type + ', error: ' + err);
        });

        this.log.debug('ZMQ: CONFIGURED!');

        // TODO: .env

        // this.receiver(socket);
        return particld;
    }
}
