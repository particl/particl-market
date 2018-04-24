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
export declare class DataDir {
    static set(dir?: string): void;
    static getDataDirPath(): string;
    static getDatabasePath(): string;
    static getDatabaseFile(): string;
    static checkIfExists(dir: string): boolean;
    static initialize(): Promise<boolean>;
    static check(): boolean;
    static createDefaultEnvFile(): Promise<boolean>;
    static getDefaultMigrationsPath(): string;
    static getDefaultSeedsPath(): string;
    private static datadir;
}
