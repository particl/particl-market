import { Container } from 'inversify';
export declare class IoC {
    container: Container;
    libConfiguration: (container: Container) => Container;
    customConfiguration: (container: Container) => Container;
    private log;
    private cliIo;
    constructor();
    configure(configuration: (container: Container) => Container): void;
    configureLib(configuration: (container: Container) => Container): void;
    bindModules(): Promise<void>;
    private bindCore();
    private bindModels();
    private bindRepositories();
    private bindServices();
    private bindCommands();
    private bindFactories();
    private bindMessageProcessors();
    private bindMiddlewares();
    private bindControllers();
    private bindListeners();
    private bindFile(type, name, value);
    private bindFiles(filePath, target, callback);
    private getClassOfFileExport(name, fileExport);
    private getTargetOfFile(name, target);
    private getBasePath();
    private getFiles(filePath, done);
    private parseFilePath(filePath);
}
