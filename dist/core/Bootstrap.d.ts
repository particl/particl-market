/// <reference types="express" />
/// <reference types="node" />
import * as http from 'http';
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Server } from './Server';
import { Logger } from './Logger';
import { IoC } from './IoC';
import { SocketIoServer } from './SocketIoServer';
export declare class Bootstrap {
    log: Logger;
    defineExpressApp(app: express.Application): express.Application;
    setupMonitor(app: express.Application): void;
    setupCoreTools(app: express.Application): void;
    startServer(app: express.Application): http.Server;
    setupInversifyExpressServer(app: express.Application, ioc: IoC): InversifyExpressServer;
    bindInversifyExpressServer(app: express.Application, inversifyExpressServer: InversifyExpressServer): express.Application;
    createSocketIoServer(server: Server, ioc: IoC): SocketIoServer;
}
