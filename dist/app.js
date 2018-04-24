"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const App_1 = require("./core/App");
const CustomConfig_1 = require("./config/CustomConfig");
exports.app = new App_1.App();
if (process.env.NODE_ENV !== 'test') {
    // Here you can add more custom configurations
    exports.app.configure(new CustomConfig_1.CustomConfig());
    // Launch the server with all his awesome features.
    exports.app.bootstrap();
}
exports.startMarket = () => {
    // Here you can add more custom configurations
    exports.app.configure(new CustomConfig_1.CustomConfig());
    // Launch the server with all his awesome features.
    exports.app.bootstrap();
};
//# sourceMappingURL=app.js.map