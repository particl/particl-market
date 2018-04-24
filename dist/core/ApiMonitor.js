"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitor = require("express-status-monitor");
const Environment_1 = require("./helpers/Environment");
class ApiMonitor {
    static getRoute() {
        return process.env.MONITOR_ROUTE;
    }
    setup(app) {
        if (Environment_1.Environment.isTruthy(process.env.MONITOR_ENABLED)) {
            app.use(monitor());
            app.get(ApiMonitor.getRoute(), monitor().pageRoute);
        }
    }
}
exports.ApiMonitor = ApiMonitor;
//# sourceMappingURL=ApiMonitor.js.map