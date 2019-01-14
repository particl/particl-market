// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

require('dotenv').config();

/**
 * This is the database configuration for the migrations and
 * the seeders.
 */
module.exports = require('./src/config/Database').DatabaseConfig();
