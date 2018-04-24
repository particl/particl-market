"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Environment_1 = require("../../core/helpers/Environment");
const os = require("os");
const path = require("path");
const fs = require("fs");
/**
 * Deals with Authentication.
 * particl-core: read the cookie file in a loop (singleton!)
 */
let CoreCookieService = class CoreCookieService {
    constructor(Logger) {
        this.Logger = Logger;
        this.DEFAULT_CORE_USER = 'test';
        this.DEFAULT_CORE_PASSWORD = 'test';
        this.log = new Logger(__filename);
        this.getCookieLoop();
    }
    /**
     * Returns either the default username or the one grabbed from the cookie file.
     * Note: cookie username is basically always "__cookie__"
     */
    getCoreRpcUsername() {
        return this.DEFAULT_CORE_USER;
    }
    /**
     * Returns either the default password or the one grabbed from the cookie file.
     */
    getCoreRpcPassword() {
        return this.DEFAULT_CORE_PASSWORD;
    }
    getCookieLoop() {
        try {
            const cookie = this.getPathToCookie();
            // we might not be running the particld locally so the cookie might not exists
            if (cookie) {
                fs.access(cookie, (error) => {
                    if (!error) {
                        // TODO: maybe add a silly level to the logger?
                        // this.log.debug('cookie file exists!');
                        fs.readFile(cookie, (err, data) => {
                            if (err) {
                                throw err;
                            }
                            // this.log.debug('cookie=', data.toString());
                            const usernameAndPassword = data.toString().split(':', 2);
                            // set username and password to cookie values
                            this.DEFAULT_CORE_USER = usernameAndPassword[0];
                            this.DEFAULT_CORE_PASSWORD = usernameAndPassword[1];
                        });
                    }
                    else {
                        // this.log.debug('cookie not found!', err);
                    }
                    return;
                });
                // grab the cookie every second
                // cookie updates everytime that the daemon restarts
                // so we need to keep on checking this due to
                // wallet encryption procedure (will reboot the daemon)
                const self = this;
                setTimeout(() => {
                    self.getCookieLoop();
                }, 1000);
            }
        }
        catch (ex) {
            this.log.debug('cookie error: ', ex);
        }
    }
    getPathToCookie() {
        // Use the stored path instead..
        if (this.PATH_TO_COOKIE) {
            return this.PATH_TO_COOKIE;
        }
        const homeDir = os.homedir ? os.homedir() : process.env['HOME'];
        let dir = '';
        const appName = 'Particl';
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
                }
                else {
                    dir = path.join(homeDir, 'AppData', 'Roaming', appName);
                }
                break;
            }
        }
        // just check if it exist so it logs an error just in case
        if (this.checkIfExists(dir)) {
            // return path to cookie
            const cookiePath = path.join(dir, (Environment_1.Environment.isDevelopment() || Environment_1.Environment.isTest() ? 'testnet' : ''), '.cookie');
            this.PATH_TO_COOKIE = cookiePath;
            return cookiePath;
        }
        return null;
    }
    checkIfExists(dir) {
        try {
            fs.accessSync(dir, fs.constants.R_OK);
            this.log.info('Found particl-core path', dir);
            return true;
        }
        catch (err) {
            this.log.error('Could not find particl-core path!', dir);
        }
        return false;
    }
};
CoreCookieService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], CoreCookieService);
exports.CoreCookieService = CoreCookieService;
//# sourceMappingURL=CoreCookieService.js.map