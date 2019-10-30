// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { Environment } from '../../../core/helpers/Environment';
import pForever from 'pm-forever';
import delay from 'pm-delay';

export enum CoreCookieServiceStatus {
    ERROR = 'ERROR',
    USING_DEFAULTS = 'USING_DEFAULTS',
    USING_COOKIE = 'USING_COOKIE'
}

/**
 * Deals with Authentication.
 * particl-core: read the cookie file in a loop (singleton!)
 */
export class CoreCookieService {

    public log: LoggerType;

    public isStarted = false;
    public updated = 0;
    public status: CoreCookieServiceStatus = CoreCookieServiceStatus.ERROR;

    private DEFAULT_CORE_USER = 'test';
    private DEFAULT_CORE_PASSWORD = 'test';
    private CORE_COOKIE_FILE = process.env.RPCCOOKIEFILE ? process.env.RPCCOOKIEFILE : '.cookie';
    private INTERVAL = 1000;
    private PATH_TO_COOKIE: string;
    private STOP = false;

    constructor(@inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
        this.start();
    }

    public async start(): Promise<void> {

        await pForever(async (i) => {
            i++;

            await this.getCookieLoop();
            this.updated = Date.now();
            if (this.STOP) {
                return pForever.end;
            }
            await delay(this.INTERVAL);
            this.log.error('CoreCookieService: ', i);

            return i;
        }, 0).catch(async reason => {
            this.log.error('ERROR: ', reason);
            await delay(this.INTERVAL);
            this.start();
        });
    }

    public async stop(): Promise<void> {
        this.STOP = true;
    }

    /**
     * Returns either the default username or the one grabbed from the cookie file.
     * Note: cookie username is basically always "__cookie__"
     */
    public getCoreRpcUsername(): string {
        return this.DEFAULT_CORE_USER;
    }

    /**
     * Returns either the default password or the one grabbed from the cookie file.
     */
    public getCoreRpcPassword(): string {
        return this.DEFAULT_CORE_PASSWORD;
    }

    public async getCookieLoop(): Promise<void> {
        const cookie = this.getPathToCookie();
        // this.log.info('getCookieLoop(), cookie path: ', cookie);

        if (cookie) {
            try {
                const data = fs.readFileSync(cookie);
                if (!this.isStarted) {
                    this.log.debug('getCookieLoop(), cookie: ', data.toString());
                }
                const usernameAndPassword = data.toString().split(':', 2);

                // set username and password to cookie values
                this.DEFAULT_CORE_USER = usernameAndPassword[0];
                this.DEFAULT_CORE_PASSWORD = usernameAndPassword[1];
                // this.log.debug('getCookieLoop(), DEFAULT_CORE_USER: ', this.DEFAULT_CORE_USER);
                // this.log.debug('getCookieLoop(), DEFAULT_CORE_PASSWORD: ', this.DEFAULT_CORE_PASSWORD);
                this.status = CoreCookieServiceStatus.USING_COOKIE;
            } catch (e) {
                if (!this.isStarted) {
                    this.log.error('ERROR: Could not find the cookie file.');
                    this.status = CoreCookieServiceStatus.USING_DEFAULTS;
                }
            }
        }
        this.isStarted = true;
    }

    private getPathToCookie(): string | null {
        // Use the stored path instead..
        if (this.PATH_TO_COOKIE) {
            return this.PATH_TO_COOKIE;
        }
        this.log.debug('PATH_TO_COOKIE: ', this.PATH_TO_COOKIE);

        const homeDir: string = os.homedir ? os.homedir() : process.env['HOME'];

        let dir = '';
        const appName = 'Particl';

        this.log.debug('process.platform: ', process.platform);

        switch (process.platform) {
          case 'linux': {
            dir = path.join(homeDir, '.' + appName.toLowerCase());
            break;
          }

          case 'darwin': {
            dir = path.join(homeDir, 'Library', 'Application Support', appName);
            break;
          }

          case 'win32': {
            const temp = path.join(process.env['APPDATA'], appName);
            if (this.checkIfExists(temp)) {
                dir = temp;
            } else {
                dir = path.join(homeDir, 'AppData', 'Roaming', appName);
            }
            break;
          }
        }

        // just check if it exist so it logs an error just in case
        if (this.checkIfExists(dir)) {
            // return path to cookie
            const cookiePath = path.join(dir, (Environment.isRegtest() ? 'regtest' : ( Environment.isTestnet() ? 'testnet' : '') ), this.CORE_COOKIE_FILE);
            this.PATH_TO_COOKIE = cookiePath;
            return cookiePath;
        }

        return null;
    }

    private checkIfExists(dir: string): boolean {
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            this.log.debug('Found particl-core path', dir);
            return true;
        } catch (err) {
            this.log.error('Could not find particl-core path!', dir);
        }
        return false;
    }
}
