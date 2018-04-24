"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
let AuthenticateMiddleware = class AuthenticateMiddleware {
    constructor(Logger, request) {
        this.request = request;
        this.use = (req, res, next) => {
            if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
                const authentication = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
                // this.log.debug('auth:' + authentication + '===' + process.env.MARKET_RPC_USER + ':' + process.env.MARKET_RPC_PASSWORD);
                if (authentication === process.env.MARKET_RPC_USER + ':' + process.env.MARKET_RPC_PASSWORD) {
                    return next();
                }
                else {
                    return res.failed(401, 'You are not allowed to request this resource!');
                }
            }
            else {
                return res.failed(401, 'You are not allowed to request this resource!');
            }
        };
        this.log = new Logger(__filename);
    }
};
AuthenticateMiddleware = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Lib)), tslib_1.__param(1, inversify_1.named('request')),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], AuthenticateMiddleware);
exports.AuthenticateMiddleware = AuthenticateMiddleware;
//# sourceMappingURL=AuthenticateMiddleware.js.map