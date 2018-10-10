"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = require("../../core/helpers/Environment");
const os = require("os");
const path = require("path");
const fs = require("fs");
const EnvironmentConfig_1 = require("../../config/EnvironmentConfig");
/**
 * core.DataDir
 * ------------------------------------
 *
 * Manages the data directories for particl-market.
 *
 *  Linux:
 *  OSX:
 *  Windows:
 *
 *  In test and development environments
 */
class DataDir {
    static getDataDirPath() {
        if (!this.datadir) {
            console.log('DataDir: not yet initialized.');
            this.initialize(EnvironmentConfig_1.envConfig());
        }
        return this.datadir;
    }
    static getDefaultDataDirPath() {
        const homeDir = os.homedir ? os.homedir() : process.env['HOME'];
        let dir = '';
        const appName = 'particl-market';
        switch (process.platform) {
            case 'linux': {
                dir = path.join(homeDir, '.' + appName);
                break;
            }
            case 'darwin': {
                dir = path.join(homeDir, 'Library', 'Application Support', appName);
                break;
            }
            case 'win32': {
                dir = path.join(process.env['APPDATA'], appName);
                break;
            }
        }
        // return path to datadir (mainnet vs testnet)
        // and set the main datadir variable.
        const dataDir = path.join(dir, (Environment_1.Environment.isRegtest() ? 'regtest' : (Environment_1.Environment.isTestnet() ? 'testnet' : '')));
        return dataDir;
    }
    static getUploadsPath() {
        return path.join(this.getDataDirPath(), 'uploads');
    }
    static getDatabasePath() {
        return path.join(this.getDataDirPath(), 'database');
    }
    static getDatabaseFile() {
        const databaseFile = path.join(this.getDatabasePath(), 'marketplace.db');
        return databaseFile;
    }
    static getLogFile() {
        return path.join(this.getDataDirPath(), process.env.LOG_PATH || 'marketplace.log');
    }
    static checkIfExists(dir, expectFailure) {
        try {
            fs.accessSync(dir, (fs.constants || fs).R_OK);
            // console.log('found:', dir);
            return true;
        }
        catch (err) {
            if (!expectFailure) {
                console.error('DataDir: Could not find path:', dir);
                console.error(err);
            }
        }
        return false;
    }
    static initialize(env) {
        console.log('DataDir: initializing folder structure..');
        // if env contains custom datadir, use that. else use default.
        if (env && env.dataDir) {
            this.datadir = env.dataDir;
        }
        else {
            this.datadir = this.getDefaultDataDirPath();
            env.dataDir = this.datadir;
        }
        const database = this.getDatabasePath();
        const uploads = this.getUploadsPath();
        console.log('initialize, datadir: ', this.datadir);
        console.log('initialize, database: ', database);
        console.log('initialize, uploads: ', uploads);
        // may also be the particl-market/testnet
        // so check if upper directory exists.
        // TODO: what is this tesnet?!
        if (this.datadir.endsWith('testnet') || this.datadir.endsWith('tesnet/') || this.datadir.endsWith('regtest')) {
            const dir = path.dirname(this.datadir); // pop the 'testnet' folder name
            if (!this.checkIfExists(dir, true)) {
                fs.mkdirSync(dir);
            }
        }
        if (!this.checkIfExists(this.datadir, true)) {
            fs.mkdirSync(this.datadir);
        }
        if (!this.checkIfExists(database, true)) {
            fs.mkdirSync(database);
        }
        if (!this.checkIfExists(uploads, true)) {
            fs.mkdirSync(uploads);
        }
        console.log('DataDir: should have created all folders, checking..');
        // do a final check, doesn't hurt.
        const ok = this.check();
        console.log('DataDir: is initialized: ', ok);
        return ok;
    }
    static check() {
        const datadir = this.getDataDirPath();
        const database = this.getDatabasePath();
        const uploads = this.getUploadsPath();
        return this.checkIfExists(datadir)
            && this.checkIfExists(database)
            && this.checkIfExists(uploads);
    }
    static createDefaultEnvFile() {
        return new Promise((resolve, reject) => {
            // The .env file that we use as template is stored in different locations
            // /somepath/particl-market/srcORdist/core/helpers -> /somepath/particl-market/srcORdist/
            let dir = path.dirname(path.dirname(__dirname));
            let dotenv;
            const mask = path.dirname(dir);
            const isDist = dir.replace(mask, '').replace(path.sep, '') === 'dist';
            if (isDist) {
                // running from a distributable
                const try1 = path.join(dir, '.env');
                if (this.checkIfExists(try1)) {
                    console.log('found distributable .env', try1);
                    dotenv = try1;
                }
                else {
                    console.error('distributable .env not found');
                    reject('distributable .env not found');
                }
            }
            else {
                // we're most likely running from source
                dir = path.dirname(dir);
                const try2 = path.join(dir, '.env');
                if (this.checkIfExists(try2)) {
                    console.log('DataDir: found the local .env', try2);
                    dotenv = try2;
                }
                else {
                    console.error('DataDir: src .env not found');
                    reject('src .env not found');
                }
            }
            // copy .env to new location!
            // TODO: error handling on streams
            console.log('copying and potentially overwritting .env file');
            const defaultDotEnvPath = path.join(this.getDataDirPath(), '.env');
            fs.createReadStream(dotenv).pipe(fs.createWriteStream(defaultDotEnvPath))
                .on('close', (ex) => {
                if (ex) {
                    reject(ex);
                }
                else {
                    // should have worked, now let's verify.
                    resolve(this.checkIfExists(defaultDotEnvPath));
                }
            });
        });
    }
    static getDefaultMigrationsPath() {
        return path.join(__dirname, '../../database/migrations');
    }
    static getDefaultSeedsPath() {
        return path.join(__dirname, '../../database/seeds');
    }
}
exports.DataDir = DataDir;
//# sourceMappingURL=DataDir.js.map