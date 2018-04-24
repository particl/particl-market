"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Environment_1 = require("../../core/helpers/Environment");
const os = require("os");
const path = require("path");
const fs = require("fs");
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
    static set(dir) {
        if (dir) {
            this.datadir = dir;
        }
    }
    static getDataDirPath() {
        // if custom configured or previously loaded, return it.
        // else compose it.
        if (this.datadir) {
            return this.datadir;
        }
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
        const dataDir = path.join(dir, (Environment_1.Environment.isDevelopment() || Environment_1.Environment.isTest() ? 'testnet' : ''));
        this.datadir = dataDir;
        return dataDir;
    }
    static getDatabasePath() {
        return path.join(this.getDataDirPath(), 'data');
    }
    static getDatabaseFile() {
        return path.join(this.getDatabasePath(), 'marketplace.db');
    }
    static checkIfExists(dir) {
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            console.log('Found particl-market path', dir);
            return true;
        }
        catch (err) {
            console.error('Could not find particl-market path!', dir);
        }
        return false;
    }
    static initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const datadir = this.getDataDirPath();
            const database = this.getDatabasePath();
            // may also be the particl-market/testnet
            // so check if upper directory exists.
            // TODO: might not be the best check
            if (datadir.endsWith('testnet') || datadir.endsWith('tesnet/')) {
                const dir = path.dirname(datadir); // pop the 'testnet' folder name
                if (!this.checkIfExists(dir)) {
                    fs.mkdirSync(dir);
                }
            }
            if (!this.checkIfExists(datadir)) {
                fs.mkdirSync(datadir);
            }
            if (!this.checkIfExists(database)) {
                fs.mkdirSync(database);
            }
            // do a final check, doesn't hurt.
            return this.check();
        });
    }
    static check() {
        const datadir = this.getDataDirPath();
        const database = this.getDatabasePath();
        return this.checkIfExists(datadir) && this.checkIfExists(database);
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
                    console.log('found the local .env', try2);
                    dotenv = try2;
                }
                else {
                    console.error('src .env not found');
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