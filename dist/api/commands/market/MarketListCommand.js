"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MarketService_1 = require("../../services/MarketService");
/*
 * Get a list of all markets
 */
let MarketListCommand = class MarketListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, marketService) {
        super(CommandEnumType_1.Commands.MARKET_LIST);
        this.Logger = Logger;
        this.marketService = marketService;
        this.log = new Logger(__filename);
    }
    /**
     * @param data
     * @returns {Promise<Bookshelf.Collection<Market>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.marketService.findAll();
        });
    }
    usage() {
        return this.getName() + ' ';
    }
    help() {
        return this.usage() + ' -  ' + this.description();
    }
    description() {
        return 'List all the markets.';
    }
    example() {
        return 'market ' + this.getName() + ' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], MarketListCommand.prototype, "execute", null);
MarketListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__metadata("design:paramtypes", [Object, MarketService_1.MarketService])
], MarketListCommand);
exports.MarketListCommand = MarketListCommand;
//# sourceMappingURL=MarketListCommand.js.map