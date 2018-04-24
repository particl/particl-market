"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const MarketService_1 = require("../../services/MarketService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let MarketAddCommand = class MarketAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, marketService) {
        super(CommandEnumType_1.Commands.MARKET_ADD);
        this.Logger = Logger;
        this.marketService = marketService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: name
     *  [1]: private_key
     *  [2]: address
     *
     * @param data
     * @returns {Promise<Market>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.marketService.create({
                name: data.params[0],
                private_key: data.params[1],
                address: data.params[2]
            });
        });
    }
    usage() {
        return this.getName() + ' <name> <privateKey> <address> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>                   - String - The unique name of the market being created. \n'
            + '    <privateKey>             - String - The private key of the market being creted. \n'
            + '    <address>                - String - [TODO] ';
    }
    description() {
        return 'Create a new market.';
    }
    example() {
        return 'market ' + this.getName() + ' market add \'Dream Market\' \'InY0uRdr34M5\' \'lchudifyeqm4ldjj\' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MarketAddCommand.prototype, "execute", null);
MarketAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__metadata("design:paramtypes", [Object, MarketService_1.MarketService])
], MarketAddCommand);
exports.MarketAddCommand = MarketAddCommand;
//# sourceMappingURL=MarketAddCommand.js.map