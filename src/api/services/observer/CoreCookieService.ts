// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import {inject, named, unmanaged} from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { Environment } from '../../../core/helpers/Environment';
import { CoreCookieServiceStatus } from '../../enums/CoreCookieServiceStatus';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';
import { EventEmitter } from '../../../core/api/events';

/**
 * Deals with Authentication.
 * particl-core: read the cookie file in a loop (singleton!)
 */
export class CoreCookieService extends BaseObserverService {

    public cookieStatus: CoreCookieServiceStatus = CoreCookieServiceStatus.USING_DEFAULTS;

    private CORE_USER = 'test';
    private CORE_PASSWORD = 'test';

    private CORE_COOKIE_FILE = process.env.RPCCOOKIEFILE ? process.env.RPCCOOKIEFILE : '.cookie';
    private PATH_TO_COOKIE: string;

    constructor(
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(__filename, 1000, Logger);
        // this.log = new Logger(__filename);
    }

    public async observerLoop(currentStatus: ObserverStatus): Promise<ObserverStatus> {

        const cookie = this.getPathToCookie();

        if (cookie) {
            try {
                const data = fs.readFileSync(cookie);
                const usernameAndPassword = data.toString().split(':', 2);

                // set username and password to cookie values
                this.CORE_USER = usernameAndPassword[0];
                this.CORE_PASSWORD = usernameAndPassword[1];

                this.cookieStatus = CoreCookieServiceStatus.USING_COOKIE;
            } catch (e) {
                this.cookieStatus = CoreCookieServiceStatus.USING_DEFAULTS;
            }
        } else {
            this.cookieStatus = CoreCookieServiceStatus.USING_DEFAULTS;
        }

        return ObserverStatus.RUNNING;
    }

    /**
     * Returns either the default username or the one grabbed from the cookie file.
     * Note: cookie username is basically always "__cookie__"
     */
    public getCoreRpcUsername(): string {
        return this.CORE_USER;
    }

    /**
     * Returns either the default password or the one grabbed from the cookie file.
     */
    public getCoreRpcPassword(): string {
        return this.CORE_PASSWORD;
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
