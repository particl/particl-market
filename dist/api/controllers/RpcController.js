"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const inversify_express_utils_1 = require("inversify-express-utils");
const app_1 = require("../../app");
const constants_1 = require("../../constants");
const jsonrpc_1 = require("../../core/api/jsonrpc");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const _ = require("lodash");
const RpcCommandFactory_1 = require("../factories/RpcCommandFactory");
const RpcRequest_1 = require("../requests/RpcRequest");
const CommandEnumType_1 = require("../commands/CommandEnumType");
// Get middlewares
const rpc = app_1.app.IoC.getNamed(constants_1.Types.Middleware, constants_1.Targets.Middleware.RpcMiddleware);
const authenticateMiddleware = app_1.app.IoC.getNamed(constants_1.Types.Middleware, constants_1.Targets.Middleware.AuthenticateMiddleware);
let rpcIdCount = 0;
let RpcController = class RpcController {
    constructor(Logger, rpcCommandFactory) {
        this.Logger = Logger;
        this.rpcCommandFactory = rpcCommandFactory;
        this.VERSION = '2.0';
        this.MAX_INT32 = 2147483647;
        this.log = new Logger(__filename);
    }
    handleRPC(res, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rpcRequest = this.createRequest(body.method, body.params, body.id);
            this.log.debug('controller.handleRPC():', rpcRequest.method + ' ' + rpcRequest.params);
            // get the commandType for the method name
            const commandType = _.find(CommandEnumType_1.Commands.rootCommands, command => command.commandName === body.method);
            if (commandType) {
                // ... use the commandType to get the correct RpcCommand implementation and execute
                const result = yield this.rpcCommandFactory.get(commandType).execute(rpcRequest, this.rpcCommandFactory);
                return this.createResponse(rpcRequest.id, result);
            }
            else {
                throw new NotFoundException_1.NotFoundException('Unknown command: ' + body.method + '\n');
            }
        });
    }
    createRequest(method, params, id) {
        if (id === null || id === undefined) {
            id = this.generateId();
        }
        else if (typeof (id) !== 'number') {
            id = String(id);
        }
        return new RpcRequest_1.RpcRequest({ jsonrpc: this.VERSION, method: method.toLowerCase(), params, id });
    }
    createResponse(id = '', result, error) {
        if (error) {
            return { id, jsonrpc: this.VERSION, error };
        }
        else {
            return { id, jsonrpc: this.VERSION, result };
        }
    }
    generateId() {
        if (rpcIdCount >= this.MAX_INT32) {
            rpcIdCount = 0;
        }
        return ++rpcIdCount;
    }
    getErrorMessage(code) {
        switch (code) {
            case jsonrpc_1.RpcErrorCode.ParseError:
                return 'Parse error';
            case jsonrpc_1.RpcErrorCode.InvalidRequest:
                return 'Invalid Request';
            case jsonrpc_1.RpcErrorCode.MethodNotFound:
                return 'Method not found';
            case jsonrpc_1.RpcErrorCode.InvalidParams:
                return 'Invalid params';
            case jsonrpc_1.RpcErrorCode.InternalError:
                return 'Internal error';
        }
        return 'Unknown Error';
    }
};
tslib_1.__decorate([
    inversify_express_utils_1.httpPost('/'),
    tslib_1.__param(0, inversify_express_utils_1.response()), tslib_1.__param(1, inversify_express_utils_1.requestBody()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RpcController.prototype, "handleRPC", null);
RpcController = tslib_1.__decorate([
    inversify_express_utils_1.controller('/rpc', authenticateMiddleware.use, rpc.use),
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Factory.RpcCommandFactory)),
    tslib_1.__metadata("design:paramtypes", [Object, RpcCommandFactory_1.RpcCommandFactory])
], RpcController);
exports.RpcController = RpcController;
//# sourceMappingURL=RpcController.js.map