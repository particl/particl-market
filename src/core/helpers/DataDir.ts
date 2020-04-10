// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Environment } from './Environment';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { envConfig } from '../../config/EnvironmentConfig';
import { EnvConfig } from '../../config/env/EnvConfig';

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

    public static getDataDirPath(): string {
        if (!this.datadir) {
            console.log('DataDir: not yet initialized.');
            this.initialize(envConfig());
        }
        return this.datadir;
    }

    public static getDefaultDataDirPath(): string {

        const homeDir: string = os.homedir ? os.homedir() : process.env['HOME'];

        let dir = '';
        const appName = 'particl-market';
        const checkpoint = '03';

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
        const dataDir = path.join(dir, (Environment.isRegtest() ? 'regtest' : ( Environment.isTestnet() ? 'testnet' : '') ), checkpoint);
        return dataDir;
    }

    public static getImagesPath(): string {
        return path.join(this.getDataDirPath(), 'images');
    }

    public static getUploadsPath(): string {
        return path.join(this.getDataDirPath(), 'uploads');
    }

    public static getDatabasePath(): string {
        return path.join(this.getDataDirPath(), 'database');
    }

    public static getDatabaseFile(): string {
        const databaseFile = path.join(this.getDatabasePath(), 'market.db');
        return databaseFile;
    }

    public static getLogFile(): string {
        return path.join(this.getDataDirPath(), process.env.LOG_PATH || 'market.log');
    }

    public static checkIfExists(dir: string, expectFailure?: boolean): boolean {
        try {
            fs.accessSync(dir, (fs.constants || fs).R_OK);
            // console.log('found:', dir);
            return true;
        } catch (err) {
            if (!expectFailure) {
                console.error('DataDir: Could not find path:', dir);
                console.error(err);
            }
        }
        return false;
    }

    public static initialize(env: EnvConfig): boolean {
        console.log('DataDir: initializing folder structure..');

        // if env contains custom datadir, use that. else use default.
        if (env && env.dataDir) {
            this.datadir = env.dataDir;
        } else {
            this.datadir = this.getDefaultDataDirPath();
            env.dataDir = this.datadir;
        }

        const database = this.getDatabasePath();
        const uploads = this.getUploadsPath();
        const images = this.getImagesPath();

        console.log('initialize, datadir: ', this.datadir);
        console.log('initialize, database: ', database);
        console.log('initialize, uploads: ', uploads);
        console.log('initialize, images: ', images);

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

        if (!this.checkIfExists(images, true)) {
            fs.mkdirSync(images);
        }

        console.log('DataDir: should have created all folders, checking..');

        // do a final check, doesn't hurt.
        const ok = this.check();
        console.log('DataDir: is initialized: ', ok);

        return ok;
    }

    public static check(): boolean {
        const datadir = this.getDataDirPath();
        const database = this.getDatabasePath();
        const uploads = this.getUploadsPath();
        const images = this.getImagesPath();

        return this.checkIfExists(datadir)
                && this.checkIfExists(database)
                && this.checkIfExists(uploads)
                && this.checkIfExists(images);
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
                    console.log('DataDir: found the local .env', try2);
                    dotenv = try2;
                } else {
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
