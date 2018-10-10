"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
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
require("reflect-metadata");
const EnvironmentConfig_1 = require("./config/EnvironmentConfig");
const App_1 = require("./core/App");
const CustomConfig_1 = require("./config/CustomConfig");
const Environment_1 = require("./core/helpers/Environment");
console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
const newApp = new App_1.App(EnvironmentConfig_1.envConfig());
if (!Environment_1.Environment.isTest() && !Environment_1.Environment.isBlackBoxTest()) {
    // integration tests will bootstrap the app
    newApp.configure(new CustomConfig_1.CustomConfig());
    newApp.bootstrap();
}
exports.app = newApp;
//# sourceMappingURL=app.js.map