// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env'.
 */
import * as packageInfo from '../../../package.json';

export enum EnvironmentType {
    ALL = 'ALL',
    PRODUCTION = 'PRODUCTION',
    TEST = 'TEST',
    BLACKBOX = 'BLACKBOX',
    ALPHA = 'ALPHA',
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

    public static isBlackBoxTest(): boolean {
        const nodeEnv = this.getNodeEnv();
        if ( nodeEnv ) {
            return nodeEnv.toUpperCase() === EnvironmentType.BLACKBOX.toString();
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

    public static getPkg(): any {
        return packageInfo;
    }

/*
    TODO: are these needed?
    public static isTestnet(): boolean {
        return !this.isProduction();
    }

    public static isRegtest(): boolean {
        return this.isTruthy(process.env.REGTEST);
    }
*/
    public static isTruthy(bool: string): boolean {
        try {
            return bool.toLowerCase() === 'true';
        } catch (e) {
            return false;
        }
    }

}
