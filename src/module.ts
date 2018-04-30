import 'reflect-metadata';
import { App } from './core/App';
import { CustomConfig } from './config/CustomConfig';
import { DataDir } from './core/helpers/DataDir';
import * as databaseMigrate from './database/migrate';

import * as path from 'path';
import { spawn } from 'child_process';

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
exports.start = () => {
    const p = path.join(__dirname, 'app.js');
    console.log('electron path:', process.execPath);
    console.log('market path:', p);
    return spawn(process.execPath, [p], { env: {NODE_ENV: 'alpha', TESTNET: true}});
};
