import { Logger as LoggerType } from '../../core/Logger';
/**
 * Deals with Authentication.
 * particl-core: read the cookie file in a loop (singleton!)
 */
export declare class CoreCookieService {
    Logger: typeof LoggerType;
    log: LoggerType;
    private DEFAULT_CORE_USER;
    private DEFAULT_CORE_PASSWORD;
    private PATH_TO_COOKIE;
    constructor(Logger: typeof LoggerType);
    /**
     * Returns either the default username or the one grabbed from the cookie file.
     * Note: cookie username is basically always "__cookie__"
     */
    getCoreRpcUsername(): string;
    /**
     * Returns either the default password or the one grabbed from the cookie file.
     */
    getCoreRpcPassword(): string;
    private getCookieLoop();
    private getPathToCookie();
    private checkIfExists(dir);
}
