import * as SocketIO from 'socket.io';
import * as http from 'http';
import { Logger } from './Logger';
import { Core, Types } from '../constants';
import { ServerStartedListener } from '../api/listeners/ServerStartedListener';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';

export class SocketIoServer {

    public tmp = 'AASDASDF';
    public socketIO: SocketIO.Server;

    private log = new Logger(__filename);
    private eventEmitter;

    constructor(public httpServer: http.Server, ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.socketIO = SocketIO(httpServer);
        this.configure();
    }

    public emit(eventType: string, msg: string): void {
        this.socketIO.emit(eventType, msg);
    }

    private configure(): void {
        this.log.debug('Configuring SocketIoServer');

        this.socketIO.on('connection', (client) => {

            this.log.debug('connection opened.');
            this.eventEmitter.emit(ServerStartedListener.Event, 'Hello!');
            this.eventEmitter.emit(ServerStartedListener.Event, 'Hello!');
            this.eventEmitter.emit(ServerStartedListener.Event, 'Hello!');
            this.eventEmitter.emit(ServerStartedListener.Event, 'Hello!');
            this.eventEmitter.emit(ServerStartedListener.Event, 'Hello!');

            setInterval(() => {
                client.emit('ping', 'ping');
            }, 10000);

            client.on('pong', (event) => console.log('received pong: ', event));
            client.on('message', (event) => console.log('received message from client: ', event));
            client.on('disconnect', (event) => console.log('client has disconnected'));
        });
    }
}
