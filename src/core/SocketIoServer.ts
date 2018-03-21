import * as SocketIO from 'socket.io';
import * as http from 'http';
import { Logger } from './Logger';
import { Core, Types } from '../constants';
import { EventEmitter } from './api/events';
import { IoC } from './IoC';

export class SocketIoServer {

    public socketIO: SocketIO;

    private log = new Logger(__filename);
    private eventEmitter;
    private clients = {};

    constructor(public httpServer: http.Server, ioc: IoC) {
        this.eventEmitter = ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        this.eventEmitter.setMaxListeners(10);
        this.socketIO = this.configure(SocketIO(httpServer));
    }

    public emit(eventType: string, msg: string): void {
        this.socketIO.emit(eventType, msg);
    }

    private configure(io: SocketIO): SocketIO {
        this.log.debug('Configuring SocketIoServer');

        io.set('transports', ['websocket']);

        // allow any user to authenticate.
        io.set('authorization', (handshake, callback) => {
            return callback(null, true);
        });

        io.on('connection', (client) => {
            this.clients[client.id] = client;
            this.log.debug('socket.io: ' + client.id + ' connected');
            this.log.debug('socket.io: ' + io.engine.clientsCount + ' sockets connected');

            // listen to messages for cli
            this.eventEmitter.on('cli', (event) => {
                this.log.debug('message for cli', event);
                client.emit('cli', event);
            });

            client.on('disconnect', (event) => {
                delete this.clients[client.id];
                this.log.debug('socket.io: ' + client.id + ' disconnected');
                this.eventEmitter.removeListener('cli', () => {
                    this.log.debug('cli', event);
                });
            });

            client.on('serverpong', (data) => {
                this.log.debug('received pong from client');
            });

        });

        setInterval(() => {
            this.log.debug('sending ping to client');
            io.sockets.emit('serverping', { data: new Date().toString()});
        }, 15000);

        return io;
    }

}
