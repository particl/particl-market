"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const Logger_1 = require("./Logger");
const LoggerConfig_1 = require("../config/LoggerConfig");
const Bootstrap_1 = require("./Bootstrap");
const Server_1 = require("./Server");
const IoC_1 = require("./IoC");
const AppConfig_1 = require("../config/AppConfig");
const constants_1 = require("../constants");
const ServerStartedListener_1 = require("../api/listeners/ServerStartedListener");
const Environment_1 = require("./helpers/Environment");
const DataDir_1 = require("./helpers/DataDir");
class App {
    constructor(dataDir) {
        this.express = express();
        this.ioc = new IoC_1.IoC();
        this.log = new Logger_1.Logger(__filename);
        this.bootstrapApp = new Bootstrap_1.Bootstrap();
        this.configurations = [];
        console.log('particl-market __dirname ', __dirname);
        // loads the .env file into the 'process.env' variable.
        if (false) {
            // Kewde: I'm leaving this as it is right now, not to mess with tests.
            // dotenv.config({path: './test/.env.test'});
        }
        else {
            if (dataDir) {
                DataDir_1.DataDir.set(dataDir);
            }
            else {
                dataDir = DataDir_1.DataDir.getDataDirPath();
            }
            const envfile = path.join(dataDir, '.env');
            console.log('particl-market env file path:', envfile);
            dotenv.config({ path: envfile });
        }
        // Configure the logger, because we need it already.
        const loggerConfig = new LoggerConfig_1.LoggerConfig();
        loggerConfig.configure();
        // Create express app
        this.log.info('NODE_ENV: ' + process.env.NODE_ENV);
        this.log.info('Defining app...');
        if (!Environment_1.Environment.isTest()) {
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
            if (!Environment_1.Environment.isTest()) {
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
            if (!Environment_1.Environment.isTest()) {
                this.log.info('Setting up IoC...');
                this.inversifyExpressServer = this.bootstrapApp.setupInversifyExpressServer(this.express, this.ioc);
                this.express = this.bootstrapApp.bindInversifyExpressServer(this.express, this.inversifyExpressServer);
                this.bootstrapApp.setupCoreTools(this.express);
                this.log.info('Starting app...');
                this.server = new Server_1.Server(this.bootstrapApp.startServer(this.express));
                this.server.use(this.express);
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