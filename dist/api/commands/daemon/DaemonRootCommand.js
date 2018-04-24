"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const RpcRequest_1 = require("../../requests/RpcRequest");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const CommandEnumType_1 = require("../CommandEnumType");
const CoreRpcService_1 = require("../../services/CoreRpcService");
let DaemonRootCommand = class DaemonRootCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, coreRpcService) {
        super(CommandEnumType_1.Commands.DAEMON_ROOT);
        this.Logger = Logger;
        this.coreRpcService = coreRpcService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('data.params:', data.params);
            const command = data.params.shift();
            const response = yield this.coreRpcService.call(command, data.params);
            this.log.debug('response: ', JSON.stringify(response));
            return response;
        });
    }
    usage() {
        return this.getName() + ' <command> [<arg> [<arg> [ ... ]]]  -  ' + this.description();
    }
    help() {
        return this.usage() + '\n'
            + '    <command>    - string - The command to execute. \n'
            + '    <arg>        - string - An argument for the rpc command. ';
    }
    description() {
        return 'Perform an rpc command on the Particl daemon.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], DaemonRootCommand.prototype, "execute", null);
DaemonRootCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__metadata("design:paramtypes", [Object, CoreRpcService_1.CoreRpcService])
], DaemonRootCommand);
exports.DaemonRootCommand = DaemonRootCommand;
//# sourceMappingURL=DaemonRootCommand.js.map