"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const App_1 = require("./core/App");
const CustomConfig_1 = require("./config/CustomConfig");
const DataDir_1 = require("./core/helpers/DataDir");
const databaseMigrate = require("./database/migrate");
/**
 * Initializes the data directory
 */
function initialize() {
    return DataDir_1.DataDir.initialize;
}
exports.initialize = initialize;
/**
 * Create the default configuration/environment file
 * in the datadir.
 */
function createDefaultEnvFile() {
    return DataDir_1.DataDir.createDefaultEnvFile;
}
exports.createDefaultEnvFile = createDefaultEnvFile;
function migrate() {
    return databaseMigrate.migrate;
}
exports.migrate = migrate;
/**
 * Starts the main application
 */
function start() {
    const app = new App_1.App();
    // Here you can add more custom configurations
    app.configure(new CustomConfig_1.CustomConfig());
    // Launch the server with all his awesome features.
    app.bootstrap();
    return app;
}
exports.start = start;
//# sourceMappingURL=module.js.map