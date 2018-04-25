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

let envConfig;

console.log('process.env.NODE_ENV:', process.env.NODE_ENV );
console.log('Environment.isTest():', Environment.isTest() );

if (Environment.isProduction()) {
    envConfig = new ProductionEnvConfig();
} else if (Environment.isDevelopment()) {
    envConfig = new DevelopmentEnvConfig();
} else if (Environment.isTest()) {
    envConfig = new TestEnvConfig('./test', '.env.test');
} else {
    envConfig = new EnvConfig('./', '.env');
}

/*
async function main(): Promise<App> {
    return new App(envConfig);
}

main()
    .then( async (app) => {
        console.log('bootstrapping app.');
        await app.bootstrap();
        console.log('app loaded.');
    })
    .catch(console.error);
*/

export const app = new App(envConfig);
if (process.env.NODE_ENV !== 'test') {
    // here you can add more custom configurations
    app.configure(new CustomConfig());
    app.bootstrap();
}

