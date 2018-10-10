"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("../config/Database");
const DataDir_1 = require("../core/helpers/DataDir");
const DevelopmentEnvConfig_1 = require("../config/env/DevelopmentEnvConfig");
exports.migrate = () => {
    console.log('Running DB migrations...');
    console.log('process.env.DB_CONNECTION:', process.env.DB_CONNECTION);
    console.log('process.env.DB_MIGRATION_DIR:', process.env.DB_MIGRATION_DIR);
    console.log('process.env.DB_SEEDS_DIR:', process.env.DB_SEEDS_DIR);
    console.log('migrate, datadir: ', DataDir_1.DataDir.getDataDirPath());
    console.log('migrate, database: ', DataDir_1.DataDir.getDatabasePath());
    console.log('migrate, uploads: ', DataDir_1.DataDir.getUploadsPath());
    const db = Database_1.Knex();
    // migrate is a bluebird promise, hack around it
    return Promise.all([
        db.migrate.latest()
    ]);
};
exports.initialize = () => {
    DataDir_1.DataDir.initialize(new DevelopmentEnvConfig_1.DevelopmentEnvConfig());
    return exports.migrate;
};
//# sourceMappingURL=migrate.js.map