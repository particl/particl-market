/**
 * EXPRESS TYPESCRIPT BOILERPLATE
 * ----------------------------------------
 *
 * This is a boilerplate for Node.js Application written in TypeScript.
 * The basic layer of this app is express. For further information visit
 * the 'README.md' file.
 *
 * To add express modules go to the 'config/AppConfig.ts' file. All the IOC registrations
 * are in the 'config/IocConfig.ts' file.
 */

import 'reflect-metadata';
import { App } from './core/App';
import { CustomConfig } from './config/CustomConfig';
import { Environment } from './core/helpers/Environment';
import { EnvConfig } from './config/env/EnvConfig';
import { DevelopmentEnvConfig } from './config/env/DevelopmentEnvConfig';
import { TestEnvConfig } from './config/env/TestEnvConfig';
import { ProductionEnvConfig } from './config/env/ProductionEnvConfig';
import { DataDir } from './core/helpers/DataDir';

let envConfig;

console.log('process.env.NODE_ENV:', process.env.NODE_ENV );

if (Environment.isProduction()) {
    envConfig = new ProductionEnvConfig();
} else if (Environment.isDevelopment()) {
    envConfig = new DevelopmentEnvConfig();
} else if (Environment.isTest()) {
    envConfig = new TestEnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env.test');
} else {
    envConfig = new EnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env');
}


console.log('envConfig.envFileName:', envConfig.envFile);
console.log('DataDir.getDataDirPath():', DataDir.getDataDirPath());
console.log('DataDir.getDatabaseFile():', DataDir.getDatabaseFile());
console.log('DataDir.getDefaultMigrationsPath():', DataDir.getDefaultMigrationsPath());
console.log('DataDir.getDefaultSeedsPath():', DataDir.getDefaultSeedsPath());

const newApp = new App(envConfig);

if (!Environment.isTest()) {
    // integration tests will bootstrap the app
    newApp.configure(new CustomConfig());
    newApp.bootstrap();

}

export const app = newApp;
