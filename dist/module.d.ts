import 'reflect-metadata';
import { App } from './core/App';
/**
 * Initializes the data directory
 */
export declare function initialize(): () => Promise<any>;
/**
 * Create the default configuration/environment file
 * in the datadir.
 */
export declare function createDefaultEnvFile(): () => Promise<any>;
export declare function migrate(): () => Promise<any>;
/**
 * Starts the main application
 */
export declare function start(): App;
