/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env'.
 */
export declare enum EnvironmentType {
    ALL = "ALL",
    PRODUCTION = "PRODUCTION",
    TEST = "TEST",
    DEVELOPMENT = "DEVELOPMENT",
    DEFAULT = "DEVELOPMENT",
}
export declare class Environment {
    static getNodeEnv(): string;
    static isTest(): boolean;
    static isDevelopment(): boolean;
    static isProduction(): boolean;
    static isTruthy(bool: string): boolean;
}
