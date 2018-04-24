"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("../config/Database");
const DataDir_1 = require("../core/helpers/DataDir");
exports.migrate = () => {
    const db = Database_1.Knex();
    // migrate is a bluebird promise, hack around it
    return Promise.all([
        db.migrate.latest()
    ]);
};
exports.initialize = () => {
    DataDir_1.DataDir.initialize();
    return exports.migrate;
};
//# sourceMappingURL=migrate.js.map