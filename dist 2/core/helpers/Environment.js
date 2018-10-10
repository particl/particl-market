"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env'.
 */
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType["ALL"] = "ALL";
    EnvironmentType["PRODUCTION"] = "PRODUCTION";
    EnvironmentType["TEST"] = "TEST";
    EnvironmentType["BLACKBOX"] = "BLACKBOX";
    EnvironmentType["ALPHA"] = "ALPHA";
    EnvironmentType["DEVELOPMENT"] = "DEVELOPMENT";
    EnvironmentType["DEFAULT"] = "DEVELOPMENT";
})(EnvironmentType = exports.EnvironmentType || (exports.EnvironmentType = {}));
class Environment {
    static getNodeEnv() {
        return process.env.NODE_ENV || EnvironmentType.DEFAULT.toString();
    }
    static isTest() {
        const nodeEnv = this.getNodeEnv();
        if (nodeEnv) {
            return nodeEnv.toUpperCase() === EnvironmentType.TEST.toString();
        }
        return false;
    }
    static isBlackBoxTest() {
        const nodeEnv = this.getNodeEnv();
        if (nodeEnv) {
            return nodeEnv.toUpperCase() === EnvironmentType.BLACKBOX.toString();
        }
        return false;
    }
    static isDevelopment() {
        const nodeEnv = this.getNodeEnv();
        if (nodeEnv) {
            return nodeEnv.toUpperCase() === EnvironmentType.DEVELOPMENT.toString();
        }
        return false;
    }
    static isProduction() {
        const nodeEnv = this.getNodeEnv();
        if (nodeEnv) {
            return nodeEnv.toUpperCase() === EnvironmentType.PRODUCTION.toString();
        }
        return false;
    }
    static isAlpha() {
        const nodeEnv = this.getNodeEnv();
        if (nodeEnv) {
            return nodeEnv.toUpperCase() === EnvironmentType.ALPHA.toString();
        }
        return false;
    }
    static isTestnet() {
        return this.isTruthy(process.env.TESTNET) || this.isAlpha();
    }
    static isRegtest() {
        return this.isTruthy(process.env.REGTEST);
    }
    static isTruthy(bool) {
        try {
            return bool.toLowerCase() === 'true';
        }
        catch (e) {
            return false;
        }
    }
}
exports.Environment = Environment;
//# sourceMappingURL=Environment.js.map