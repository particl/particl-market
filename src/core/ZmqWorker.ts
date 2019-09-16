// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as SocketIO from 'socket.io';
import * as http from 'http';
import { Logger } from './Logger';
import { Core, Types } from '../constants';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';
import { Pull } from 'zeromq-ng';

export class ZmqWorker {

    public clientSocket: Pull;

    private log = new Logger(__filename);
    private eventEmitter;

    constructor(ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.eventEmitter.setMaxListeners(10);
        this.clientSocket = this.configure();
    }

    public emit(eventType: string, msg: string): void {
        // this.clientSocket.emit(eventType, msg);
    }

    private configure(): Pull {
        this.log.debug('Configuring ZmqWorker');

        const socket = new Pull();
        // TODO: .env
        socket.connect('tcp://127.0.0.1:29001');
        this.receiver();
        return socket;
    }

    private receiver(): void {
        if (!this.clientSocket.closed) {
            setTimeout(async () => {
                const [msg] = await this.clientSocket.receive();
                this.log.debug('receive(): ', msg.toString());
                this.receiver();
            }, 1);
        } else {
            setTimeout(async () => {
                this.log.debug('receive(): clientSocket.closed');
                this.receiver();
            }, 1000);
        }
    }

}
