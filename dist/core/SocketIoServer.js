"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIO = require("socket.io");
const Logger_1 = require("./Logger");
const constants_1 = require("../constants");
class SocketIoServer {
    constructor(httpServer, ioc) {
        this.httpServer = httpServer;
        this.log = new Logger_1.Logger(__filename);
        this.clients = {};
        this.eventEmitter = ioc.container.getNamed(constants_1.Types.Core, constants_1.Core.Events);
        this.eventEmitter.setMaxListeners(10);
        this.socketIO = this.configure(SocketIO(httpServer));
    }
    emit(eventType, msg) {
        this.socketIO.emit(eventType, msg);
    }
    configure(io) {
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
                // this.log.debug('received pong from client');
            });
        });
        setInterval(() => {
            // this.log.debug('sending ping to client');
            io.sockets.emit('serverping', { data: new Date().toString() });
        }, 15000);
        return io;
    }
}
exports.SocketIoServer = SocketIoServer;
//# sourceMappingURL=SocketIoServer.js.map