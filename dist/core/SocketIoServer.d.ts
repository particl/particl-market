/// <reference types="node" />
import * as SocketIO from 'socket.io';
import * as http from 'http';
import { IoC } from './IoC';
export declare class SocketIoServer {
    httpServer: http.Server;
    socketIO: SocketIO;
    private log;
    private eventEmitter;
    private clients;
    constructor(httpServer: http.Server, ioc: IoC);
    emit(eventType: string, msg: string): void;
    private configure(io);
}
