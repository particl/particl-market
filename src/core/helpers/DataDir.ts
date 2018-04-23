import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Environment } from '../../core/helpers/Environment';
import { migrate } from '../../database/migrate';

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';


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

    public static checkIfExists(dir: string): boolean {
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            this.log.info('Found particl-market path', dir);
            return true;
        } catch (err) {
            this.log.error('Could not find particl-market path!', dir);
        }
        return false;
    }

    public static async initialize(): Promise<boolean> {
        const datadir = this.getDataDirPath();
        const database = this.getDatabasePath();

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

    private static log: LoggerType = new LoggerType(__filename);
    private static datadir: string;
}
