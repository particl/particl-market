import { inject, named } from 'inversify';
import { Environment } from '../../core/helpers/Environment';
import { migrate } from '../../database/migrate';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { dirname } from 'path';


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
export class DataDir {

    public static set(dir?: string): void {
        if (dir) {
            this.datadir = dir;
        }
    }

    public static getDataDirPath(): string {

        // if custom configured or previously loaded, return it.
        // else compose it.
        if (this.datadir) {
            return this.datadir;
        }

        const homeDir: string = os.homedir ? os.homedir() : process.env['HOME'];

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
        const dataDir = path.join(dir, (Environment.isDevelopment() || Environment.isTest() ? 'testnet' : ''));
        this.datadir = dataDir;
        return dataDir;
    }

    public static getDatabasePath(): string {
        return path.join(this.getDataDirPath(), 'data');
    }

    public static getDatabaseFile(): string {
        return path.join(this.getDatabasePath(), 'marketplace.db');
    }

    public static checkIfExists(dir: string): boolean {
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            console.log('Found particl-market path', dir);
            return true;
        } catch (err) {
            console.error('Could not find particl-market path!', dir);
        }
        return false;
    }

    public static async initialize(): Promise<boolean> {
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
    }

    public static check(): boolean {
        const datadir = this.getDataDirPath();
        const database = this.getDatabasePath();
        return this.checkIfExists(datadir) && this.checkIfExists(database);
    }

    public static createDefaultEnvFile(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // The .env file that we use as template is stored in different locations
            // /somepath/particl-market/srcORdist/core/helpers -> /somepath/particl-market/srcORdist/
            let dir = path.dirname(path.dirname(__dirname));
            let dotenv;

            const mask = path.dirname(dir);
            const isDist: boolean = dir.replace(mask, '').replace(path.sep, '') === 'dist';

            if (isDist) {
                // running from a distributable
                const try1 = path.join(dir, '.env');
                if (this.checkIfExists(try1)) {
                    console.log('found distributable .env', try1);
                    dotenv = try1;
                } else {
                    console.error('distributable .env not found');
                    reject('distributable .env not found');
                }
            } else {
                // we're most likely running from source
                dir = path.dirname(dir);
                const try2 = path.join(dir, '.env');
                if (this.checkIfExists(try2)) {
                    console.log('found the local .env', try2);
                    dotenv = try2;
                } else {
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
                } else {
                    // should have worked, now let's verify.
                    resolve(this.checkIfExists(defaultDotEnvPath));
                }
            });
        });
    }

    public static getDefaultMigrationsPath(): string {
        return path.join(__dirname, '../../database/migrations');
    }

    public static getDefaultSeedsPath(): string {
        return path.join(__dirname, '../../database/seeds');
    }

    private static datadir: string;
}
