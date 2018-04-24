/// <reference types="express" />
import * as express from 'express';
import { Container } from 'inversify';
import { Logger } from './Logger';
import { Server } from './Server';
export interface Configurable {
    configure(app: App): void;
}
export declare class App {
    private express;
    private server;
    private socketIoServer;
    private inversifyExpressServer;
    private ioc;
    private log;
    private bootstrapApp;
    private configurations;
    constructor(dataDir?: string);
    readonly IoC: Container;
    readonly Express: express.Application;
    readonly Server: Server;
    Logger(scope: string): Logger;
    configure(configurations: Configurable): void;
    /**
     * ..called from app.ts
     *
     * @returns {Promise<EventEmitter>}
     */
    bootstrap(): Promise<any>;
}
