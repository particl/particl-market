"use strict";
/**
 * IOC - CONTAINER
 * ----------------------------------------
 *
 * Bind every controller and service to the ioc container. All controllers
 * will then be bonded to the express structure with their defined routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const glob = require("glob");
const path = require("path");
const inversify_1 = require("inversify");
const constants_1 = require("../constants");
const events_1 = require("./api/events");
const Logger_1 = require("./Logger");
const IocConfig_1 = require("../config/IocConfig");
const Environment_1 = require("./helpers/Environment");
class IoC {
    constructor() {
        this.log = new Logger_1.Logger(__filename);
        this.container = new inversify_1.Container();
        const config = new IocConfig_1.IocConfig();
        config.configure(this);
    }
    configure(configuration) {
        this.customConfiguration = configuration;
    }
    configureLib(configuration) {
        this.libConfiguration = configuration;
    }
    bindModules() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('binding core');
            this.bindCore();
            if (this.libConfiguration) {
                this.container = this.libConfiguration(this.container);
            }
            this.log.info('binding models');
            yield this.bindModels();
            this.log.info('binding repositories');
            yield this.bindRepositories();
            this.log.info('binding services');
            yield this.bindServices();
            this.log.info('binding commands');
            yield this.bindCommands();
            this.log.info('binding factories');
            yield this.bindFactories();
            this.log.info('binding message processors');
            yield this.bindMessageProcessors();
            this.log.info('binding listeners');
            yield this.bindListeners();
            if (!Environment_1.Environment.isTest()) {
                yield this.bindMiddlewares();
                yield this.bindControllers();
            }
            if (this.customConfiguration) {
                this.container = this.customConfiguration(this.container);
            }
        });
    }
    bindCore() {
        this.container.bind(constants_1.Types.Core).toConstantValue(Logger_1.Logger).whenTargetNamed(constants_1.Core.Logger);
        this.container.bind(constants_1.Types.Core).toConstantValue(events_1.events).whenTargetNamed(constants_1.Core.Events);
    }
    bindModels() {
        return this.bindFiles('/models/**/*.ts', constants_1.Targets.Model, (name, value) => {
            inversify_1.decorate(inversify_1.injectable(), value);
            this.container
                .bind(constants_1.Types.Model)
                .toConstantValue(value)
                .whenTargetNamed(name);
        });
    }
    bindRepositories() {
        return this.bindFiles('/repositories/**/*Repository.ts', constants_1.Targets.Repository, (name, value) => this.bindFile(constants_1.Types.Repository, name, value));
    }
    bindServices() {
        return this.bindFiles('/services/**/*Service.ts', constants_1.Targets.Service, (name, value) => this.bindFile(constants_1.Types.Service, name, value));
    }
    bindCommands() {
        return this.bindFiles('/commands/**/*Command.ts', constants_1.Targets.Command, (name, value) => this.bindFile(constants_1.Types.Command, name, value));
    }
    bindFactories() {
        return this.bindFiles('/factories/**/*Factory.ts', constants_1.Targets.Factory, (name, value) => this.bindFile(constants_1.Types.Factory, name, value));
    }
    bindMessageProcessors() {
        return this.bindFiles('/messageprocessors/**/*MessageProcessor.ts', constants_1.Targets.MessageProcessor, (name, value) => this.bindFile(constants_1.Types.MessageProcessor, name, value));
    }
    bindMiddlewares() {
        return this.bindFiles('/middlewares/**/*Middleware.ts', constants_1.Targets.Middleware, (name, value) => this.bindFile(constants_1.Types.Middleware, name, value));
    }
    bindControllers() {
        return this.bindFiles('/controllers/**/*Controller.ts', constants_1.Targets.Controller, (name, value) => this.bindFile(constants_1.Types.Controller, name, value));
    }
    bindListeners() {
        return this.bindFiles('/listeners/**/*Listener.ts', constants_1.Targets.Listener, (name, value) => {
            inversify_1.decorate(inversify_1.injectable(), value);
            this.container
                .bind(constants_1.Types.Listener)
                .to(value)
                .inSingletonScope()
                .whenTargetNamed(name);
            const listener = this.container.getNamed(constants_1.Types.Listener, name);
            events_1.events.on(value.Event, (...args) => listener.act(...args));
        });
    }
    bindFile(type, name, value) {
        inversify_1.decorate(inversify_1.injectable(), value);
        this.container
            .bind(type)
            .to(value)
            .inSingletonScope()
            .whenTargetNamed(name);
    }
    bindFiles(filePath, target, callback) {
        return new Promise((resolve) => {
            this.getFiles(filePath, (files) => {
                // this.log.info('bindFiles, filePath:', filePath);
                // this.log.info('bindFiles, files:', files);
                files.forEach((file) => {
                    let fileExport;
                    let fileClass;
                    let fileTarget;
                    const isRecursive = file.name.indexOf('.') > 0;
                    try {
                        fileExport = require(`${file.filePath}`);
                    }
                    catch (e) {
                        this.log.warn(e.message);
                        return;
                    }
                    if (fileExport === undefined) {
                        this.log.warn(`Could not find the file ${file.name}!`);
                        return;
                    }
                    if (isRecursive) {
                        fileClass = this.getClassOfFileExport(file.name, fileExport);
                        fileTarget = this.getTargetOfFile(file.name, target);
                    }
                    else {
                        fileClass = fileExport[file.name];
                        fileTarget = target && target[file.name];
                    }
                    if (fileClass === undefined) {
                        this.log.warn(`Name of the file '${file.name}' does not match to the class name!`);
                        return;
                    }
                    if (fileTarget === undefined) {
                        this.log.warn(`Please define your '${file.name}' class is in the target constants.`);
                        return;
                    }
                    callback(fileTarget, fileClass);
                });
                resolve();
            });
        });
    }
    getClassOfFileExport(name, fileExport) {
        const fileParts = name.split('.');
        let fileClass = fileExport;
        fileParts.forEach((part) => {
            if (fileClass.hasOwnProperty(part)) {
                fileClass = fileClass[part];
            }
        });
        return fileClass;
    }
    getTargetOfFile(name, target) {
        const fileParts = name.split('.');
        let fileTarget = target;
        fileParts.forEach((part) => {
            fileTarget = fileTarget[part];
        });
        return fileTarget;
    }
    getBasePath() {
        const baseFolder = __dirname.indexOf(`${path.sep}src${path.sep}`) >= 0 || __dirname.indexOf(`${path.sep}test${path.sep}`) >= 0
            ? `${path.sep}src${path.sep}`
            : `${path.sep}dist${path.sep}`;
        const baseRoot = __dirname.substring(0, __dirname.indexOf(baseFolder)); // path.normalize(__dirname + '/../../..')
        // this.log.info('baseFolder: ', baseFolder);
        // this.log.info('baseRoot: ', baseFolder);
        return path.join(baseRoot, baseFolder, 'api');
    }
    getFiles(filePath, done) {
        const isTypeScript = __dirname.indexOf(`${path.sep}src${path.sep}`) >= 0 || __dirname.indexOf(`${path.sep}test${path.sep}`) >= 0;
        if (!isTypeScript) {
            filePath = filePath.replace('.ts', '.js');
        }
        const pattern = this.getBasePath() + filePath;
        glob(pattern, (err, files) => {
            if (err) {
                this.log.warn(`Could not read the folder ${filePath}!`);
                return;
            }
            done(files.map((p) => this.parseFilePath(p)));
        });
    }
    parseFilePath(filePath) {
        const p = filePath.substring(this.getBasePath().length + 1);
        const dir = p.split('/')[0];
        const file = p.substr(dir.length + 1);
        const name = file.replace('/', '.').substring(0, file.length - 3);
        return {
            filePath,
            dir,
            file,
            name
        };
    }
}
exports.IoC = IoC;
//# sourceMappingURL=IoC.js.map