// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as express from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Logger } from './Logger';
import { LoggerConfig } from '../config/LoggerConfig';
import { Bootstrap } from './Bootstrap';
import { Server } from './Server';
import { IoC } from './IoC';
import { AppConfig } from '../config/AppConfig';
import { Types, Core } from '../constants';
import { EventEmitter } from './api/events';
import { ServerStartedListener } from '../api/listeners/ServerStartedListener';
import { SocketIoServer } from './SocketIoServer';
import { EnvConfig } from '../config/env/EnvConfig';
import { DataDir } from './helpers/DataDir';
import * as databaseMigrate from '../database/migrate';
import { Environment } from './helpers/Environment';
import { MessageException } from '../api/exceptions/MessageException';
import { envConfig } from '../config/EnvironmentConfig';
import * as dotenv from 'dotenv';
import { ZmqWorker } from './ZmqWorker';

export interface Configurable {
    configure(app: App): void;
}

export class App {

    private express: express.Application = express();
    private server: Server;
    private socketIoServer: SocketIoServer;
    private zmqWorker: ZmqWorker;
    private inversifyExpressServer: InversifyExpressServer;
    private ioc: IoC = new IoC();
    private log: Logger = new Logger(__filename);
    private bootstrapApp: Bootstrap;
    private configurations: Configurable[] = [];

    constructor() {

        // if envConfig isn't given, use ProductionEnvConfig
        this.bootstrapApp = new Bootstrap();

        // Configure the logger, because we need it already.
        const loggerConfig = new LoggerConfig();
        loggerConfig.configure();

        if (process.env.EXPRESS_ENABLED) {
            this.bootstrapApp.defineExpressApp(this.express);
        }
    }

    get IoC(): Container {
        return this.ioc.container;
    }

    get Express(): express.Application {
        return this.express;
    }

    get Server(): Server {
        return this.server;
    }

    get SocketIOServer(): SocketIoServer {
        return this.socketIoServer;
    }

    public Logger(scope: string): Logger {
        return new Logger(scope || __filename);
    }

    public configure(configurations: Configurable): void {
        this.configurations.push(configurations);
    }

    /**
     * ..called from app.ts
     *
     * @returns {Promise<EventEmitter>}
     */
    public async bootstrap(): Promise<any> {
        this.log.info('Configuring app...');

        if (Environment.isTruthy(process.env.INIT)) {
            await DataDir.createDefaultEnvFile()
                .catch(reason => {
                    this.log.error('Error: ', JSON.stringify(reason, null, 2));
                    // TODO: exit codes for different problems
                    return process.exit(1);
                });
        }

        // loads the .env file into the 'process.env' variable, in case it hasn't been loaded already
        const config: EnvConfig = envConfig();
        dotenv.config({ path: config.envFile });

        // Perform database migrations
        // TODO: migrate fails when db is created from the desktop and when run from the market project and vice versa
        if (Environment.isTruthy(process.env.MIGRATE)) {
            const result = await databaseMigrate.migrate()
                .catch(reason => {
                    this.log.error('migration error: ', JSON.stringify(reason, null, 2));
                    throw new MessageException(reason);
                })
                .then(value => {
                    this.log.info('migration result: ', JSON.stringify(value, null, 2));
                });
        } else {
            this.log.debug('Skipping database migration.');
        }

        if (Environment.isTruthy(process.env.EXPRESS_ENABLED)) {
            // Add express monitor app
            this.bootstrapApp.setupMonitor(this.express);
            // Configure the app config for all the middlewares
            const appConfig = new AppConfig();
            appConfig.configure(this);
            // Configure all custom configurations
            this.configurations.forEach((c) => c.configure(this));
        }

        // Setup the ioc of inversify
        this.log.info('Binding IoC modules...');
        await this.ioc.bindModules();

        if (Environment.isTruthy(process.env.EXPRESS_ENABLED)) {
            this.log.info('Setting up IoC...');
            this.inversifyExpressServer = this.bootstrapApp.setupInversifyExpressServer(this.express, this.ioc);
            this.express = this.bootstrapApp.bindInversifyExpressServer(this.express, this.inversifyExpressServer);
            this.bootstrapApp.setupCoreTools(this.express);
            this.log.info('Starting app...');

            this.server = new Server(this.bootstrapApp.startServer(this.express));
            this.server.use(this.express);
        }

        if (Environment.isTruthy(process.env.SOCKETIO_ENABLED)) {
            // create our socketioserver
            this.socketIoServer = this.bootstrapApp.createSocketIoServer(this.server, this.ioc);
        }

        this.zmqWorker = this.bootstrapApp.createZmqWorker(this.ioc);

        this.log.info('App is ready!');

        const eventEmitter = this.ioc.container.getNamed<EventEmitter>(Types.Core, Core.Events);
        eventEmitter.emit(ServerStartedListener.Event, 'Hello!');

        return eventEmitter;
    }

}
