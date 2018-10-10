"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const Logger_1 = require("./Logger");
const LoggerConfig_1 = require("../config/LoggerConfig");
const Bootstrap_1 = require("./Bootstrap");
const Server_1 = require("./Server");
const IoC_1 = require("./IoC");
const AppConfig_1 = require("../config/AppConfig");
const constants_1 = require("../constants");
const ServerStartedListener_1 = require("../api/listeners/ServerStartedListener");
const ProductionEnvConfig_1 = require("../config/env/ProductionEnvConfig");
const DataDir_1 = require("./helpers/DataDir");
const databaseMigrate = require("../database/migrate");
const Environment_1 = require("./helpers/Environment");
class App {
    constructor(envConfig) {
        this.express = express();
        this.ioc = new IoC_1.IoC();
        this.log = new Logger_1.Logger(__filename);
        this.configurations = [];
        // if envConfig isn't given, use ProductionEnvConfig
        this.envConfig = !envConfig ? new ProductionEnvConfig_1.ProductionEnvConfig() : envConfig;
        this.bootstrapApp = new Bootstrap_1.Bootstrap(this.envConfig);
        // Configure the logger, because we need it already.
        const loggerConfig = new LoggerConfig_1.LoggerConfig();
        loggerConfig.configure();
        if (process.env.EXPRESS_ENABLED) {
            this.log.info('Defining app...');
            this.bootstrapApp.defineExpressApp(this.express);
        }
    }
    get IoC() {
        return this.ioc.container;
    }
    get Express() {
        return this.express;
    }
    get Server() {
        return this.server;
    }
    Logger(scope) {
        return new Logger_1.Logger(scope || __filename);
    }
    configure(configurations) {
        this.configurations.push(configurations);
    }
    /**
     * ..called from app.ts
     *
     * @returns {Promise<EventEmitter>}
     */
    bootstrap() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('Configuring app...');
            if (Environment_1.Environment.isTruthy(process.env.INIT)) {
                yield DataDir_1.DataDir.createDefaultEnvFile()
                    .catch(reason => {
                    this.log.error('Error: ', JSON.stringify(reason, null, 2));
                    // TODO: exit codes for different problems
                    return process.exit(1);
                });
            }
            // Perform database migrations
            // TODO: migrate fails when db is created from the desktop and when run from the marketplace project and vice versa
            if (Environment_1.Environment.isTruthy(process.env.MIGRATE)) {
                const result = yield databaseMigrate.migrate();
                this.log.error('migration result: ', JSON.stringify(result, null, 2));
            }
            else {
                this.log.debug('Skipping database migration.');
            }
            if (Environment_1.Environment.isTruthy(process.env.EXPRESS_ENABLED)) {
                // Add express monitor app
                this.bootstrapApp.setupMonitor(this.express);
                // Configure the app config for all the middlewares
                const appConfig = new AppConfig_1.AppConfig();
                appConfig.configure(this);
                // Configure all custom configurations
                this.configurations.forEach((c) => c.configure(this));
            }
            // Setup the ioc of inversify
            this.log.info('Binding IoC modules...');
            yield this.ioc.bindModules();
            if (Environment_1.Environment.isTruthy(process.env.EXPRESS_ENABLED)) {
                this.log.info('Setting up IoC...');
                this.inversifyExpressServer = this.bootstrapApp.setupInversifyExpressServer(this.express, this.ioc);
                this.express = this.bootstrapApp.bindInversifyExpressServer(this.express, this.inversifyExpressServer);
                this.bootstrapApp.setupCoreTools(this.express);
                this.log.info('Starting app...');
                this.server = new Server_1.Server(this.bootstrapApp.startServer(this.express));
                this.server.use(this.express);
            }
            if (Environment_1.Environment.isTruthy(process.env.SOCKETIO_ENABLED)) {
                // create our socketioserver
                this.socketIoServer = this.bootstrapApp.createSocketIoServer(this.server, this.ioc);
            }
            this.log.info('App is ready!');
            const eventEmitter = this.ioc.container.getNamed(constants_1.Types.Core, constants_1.Core.Events);
            eventEmitter.emit(ServerStartedListener_1.ServerStartedListener.Event, 'Hello!');
            return eventEmitter;
        });
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map