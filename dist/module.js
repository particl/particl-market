"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const App_1 = require("./core/App");
const CustomConfig_1 = require("./config/CustomConfig");
exports.start = () => {
    const app = new App_1.App();
    // Here you can add more custom configurations
    app.configure(new CustomConfig_1.CustomConfig());
    // Launch the server with all his awesome features.
    app.bootstrap();
    return app;
};
//# sourceMappingURL=module.js.map