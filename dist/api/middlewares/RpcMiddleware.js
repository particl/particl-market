"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ServerStartedListener_1 = require("../listeners/ServerStartedListener");
// import { app } from '../../app';
let RpcMiddleware = class RpcMiddleware {
    constructor(serverStartedListener, Logger) {
        this.serverStartedListener = serverStartedListener;
        this.use = (req, res, next) => {
            if (!this.serverStartedListener.isStarted) {
                return res.failed(503, 'Server not fully started yet, is particld running?');
            }
            // validate rpc request
            if (this.isValidVersionTwoRequest(req)) {
                next();
            }
            else {
                return res.failed(400, 'Invalid JSON-RPC 2.0 request');
            }
        };
        this.log = new Logger(__filename);
    }
    isValidVersionTwoRequest(request) {
        return (request
            && request.headers
            && request.headers['content-type']
            && request.headers['content-type'].indexOf('application/json') > -1
            && request.body
            && typeof (request.body) === 'object'
            && request.body.jsonrpc === '2.0'
            && typeof (request.body.method) === 'string'
            && (typeof (request.body.params) === 'undefined'
                || Array.isArray(request.body.params)
                || (request.body.params && typeof (request.body.params) === 'object'))
            && (typeof (request.body.id) === 'undefined'
                || typeof (request.body.id) === 'string'
                || typeof (request.body.id) === 'number'
                || request.body.id === null));
    }
};
RpcMiddleware = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Listener)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Listener.ServerStartedListener)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ServerStartedListener_1.ServerStartedListener, Object])
], RpcMiddleware);
exports.RpcMiddleware = RpcMiddleware;
//# sourceMappingURL=RpcMiddleware.js.map