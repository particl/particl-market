/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env'.
 */

export enum EnvironmentType {
    ALL = 'ALL',
    PRODUCTION = 'PRODUCTION',
    TEST = 'TEST',
    ALPHA = 'ALPHA',
    DEVELOPMENT = 'DEVELOPMENT',
    DEFAULT = DEVELOPMENT
}

export class Environment {

    public static useExpress = true;
    public static useSocketIO = true;

    public static getNodeEnv(): string {
        return process.env.NODE_ENV || EnvironmentType.DEFAULT.toString();
    }

    public static isTest(): boolean {
        const nodeEnv = this.getNodeEnv();
        if ( nodeEnv ) {
            return nodeEnv.toUpperCase() === EnvironmentType.TEST.toString();
        }
        return false;
    }

    public static isDevelopment(): boolean {
        const nodeEnv = this.getNodeEnv();
        if ( nodeEnv ) {
            return nodeEnv.toUpperCase() === EnvironmentType.DEVELOPMENT.toString();
        }
        return false;
    }

    public static isProduction(): boolean {
        const nodeEnv = this.getNodeEnv();
        if ( nodeEnv ) {
            return nodeEnv.toUpperCase() === EnvironmentType.PRODUCTION.toString();
        }
        return false;
    }

    public static isAlpha(): boolean {
        const nodeEnv = this.getNodeEnv();
        if ( nodeEnv ) {
            return nodeEnv.toUpperCase() === EnvironmentType.ALPHA.toString();
        }
        return false;
    }

    public static isTestnet(): boolean {
        return process.env.TESTNET === true || this.isAlpha();
    }

    public static isTruthy(bool: string): boolean {
        try {
            return bool.toLowerCase() === 'true';
        } catch (e) {
            return false;
        }
    }

}
