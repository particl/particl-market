import * as SocketIO from 'socket.io';
import * as http from 'http';
import { Logger } from './Logger';
import { Core, Types } from '../constants';
import { ServerStartedListener } from '../api/listeners/ServerStartedListener';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';

export class SocketIoServer {

    public socketIO: SocketIO;

    private log = new Logger(__filename);
    private eventEmitter;

    constructor(public httpServer: http.Server, ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.socketIO = this.configure(SocketIO(httpServer));
    }

    public emit(eventType: string, msg: string): void {
        this.socketIO.emit(eventType, msg);
    }

    private configure(io: SocketIO): SocketIO {
        this.log.debug('Configuring SocketIoServer');

        io.set('transports', ['websocket', 'polling']);

        io.on('connection', (client) => {
            this.log.info('socket.io: user connected');

            // listen to messages for cli
            this.eventEmitter.on('cli', (event) => {
                console.log('message for cli', event);
                client.emit('cli', event);
            });

            client.on('disconnect', (event) => {
                this.log.info('socket.io: user disconnected');
                this.eventEmitter.removeAllListeners('cli');
            });
        });

        return io;
    }

}
