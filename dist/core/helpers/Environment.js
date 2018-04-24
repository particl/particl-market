"use strict";
/**
 * core.Environment
 * ------------------------------------
 *
 * Helps us to simplify 'process.env'.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var EnvironmentType;
(function (EnvironmentType) {
    EnvironmentType["ALL"] = "ALL";
    EnvironmentType["PRODUCTION"] = "PRODUCTION";
    EnvironmentType["TEST"] = "TEST";
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