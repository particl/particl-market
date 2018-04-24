"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Environment_1 = require("./helpers/Environment");
class CliIndex {
    static getRoute() {
        return process.env.CLI_ROUTE;
    }
    setup(app) {
        if (Environment_1.Environment.isTruthy(process.env.CLI_ENABLED)) {
            app.use(express.static('public'));
        }
    }
}
exports.CliIndex = CliIndex;
//# sourceMappingURL=CliIndex.js.map