"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = require("./helpers/Environment");
const SwaggerUI_1 = require("./SwaggerUI");
const ApiMonitor_1 = require("./ApiMonitor");
class ApiInfo {
    static getRoute() {
        return process.env.APP_URL_PREFIX + process.env.API_INFO_ROUTE;
    }
    setup(app) {
        if (Environment_1.Environment.isTruthy(process.env.API_INFO_ENABLED)) {
            app.get(ApiInfo.getRoute(), (req, res) => {
                // const pkg = Environment.getPkg();
                const links = {
                    links: {}
                };
                if (Environment_1.Environment.isTruthy(process.env.SWAGGER_ENABLED)) {
                    links.links['swagger'] =
                        `${app.get('host')}:${app.get('port')}${SwaggerUI_1.SwaggerUI.getRoute()}`;
                }
                if (Environment_1.Environment.isTruthy(process.env.MONITOR_ENABLED)) {
                    links.links['monitor'] =
                        `${app.get('host')}:${app.get('port')}${ApiMonitor_1.ApiMonitor.getRoute()}`;
                }
                // todo: get the pkg data somewhere
                return res.json(Object.assign({ name: 'particl-marketplace', version: 'alpha', description: '' }, links));
            });
        }
    }
}
exports.ApiInfo = ApiInfo;
//# sourceMappingURL=ApiInfo.js.map