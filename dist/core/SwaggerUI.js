"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const Environment_1 = require("./helpers/Environment");
class SwaggerUI {
    static getRoute() {
        return process.env.APP_URL_PREFIX + process.env.SWAGGER_ROUTE;
    }
    setup(app) {
        if (Environment_1.Environment.isTruthy(process.env.SWAGGER_ENABLED)) {
            const baseFolder = __dirname.indexOf(`${path.sep}src${path.sep}`) >= 0 ? `${path.sep}src${path.sep}` : `${path.sep}dist${path.sep}`;
            const basePath = __dirname.substring(0, __dirname.indexOf(baseFolder));
            const swaggerFile = require(path.join(basePath, process.env.SWAGGER_FILE));
            const packageJson = require(path.join(basePath, 'package.json'));
            // Add npm infos to the swagger doc
            swaggerFile.info = {
                title: packageJson.name,
                description: packageJson.description,
                version: packageJson.version
            };
            // Initialize swagger-jsdoc -> returns validated swagger spec in json format
            app.use(SwaggerUI.getRoute(), swaggerUi.serve, swaggerUi.setup(swaggerFile));
        }
    }
}
exports.SwaggerUI = SwaggerUI;
//# sourceMappingURL=SwaggerUI.js.map