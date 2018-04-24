import 'reflect-metadata';
import { App } from './core/App';
import { CustomConfig } from './config/CustomConfig';
import { DataDir } from './core/helpers/DataDir';
import * as databaseMigrate from './database/migrate';

/**
 * Initializes the data directory
 */
export function initialize(): Promise<any> {
    return DataDir.initialize();
}

/**
 * Create the default configuration/environment file
 * in the datadir.
 */
export function createDefaultEnvFile(): Promise<any> {
    return DataDir.createDefaultEnvFile();
}

export function migrate(): Promise<any> {
    return databaseMigrate.migrate();
}

/**
 * Starts the main application
 */
export function start(): App {
    const app = new App();
    // Here you can add more custom configurations
    app.configure(new CustomConfig());

    // Launch the server with all his awesome features.
    app.bootstrap();
    return app;
}
