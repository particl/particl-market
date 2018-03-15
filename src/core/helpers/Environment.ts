/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env' and also provide
 * the content of the package.json.
 */
import * as packageInfo from '../../../package.json';


export enum EnvironmentType {
    ALL = 'ALL',
    PRODUCTION = 'PRODUCTION',
    TEST = 'TEST',
    DEVELOPMENT = 'DEVELOPMENT',
    DEFAULT = DEVELOPMENT
}

export class Environment {

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

    public static getPkg(): any {
        return packageInfo;
    }

    public static isTruthy(bool: string): boolean {
        try {
            return bool.toLowerCase() === 'true';
        } catch (e) {
            return false;
        }
    }

}
