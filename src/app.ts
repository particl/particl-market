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
import { envConfig } from './config/EnvironmentConfig';
import { App } from './core/App';
import { CustomConfig } from './config/CustomConfig';
import { Environment } from './core/helpers/Environment';

console.log('process.env.NODE_ENV:', process.env.NODE_ENV );

const newApp = new App(envConfig());

if (!Environment.isTest() && !Environment.isBlackBoxTest()) {
    // integration tests will bootstrap the app
    newApp.configure(new CustomConfig());
    newApp.bootstrap();

}

export const app = newApp;
