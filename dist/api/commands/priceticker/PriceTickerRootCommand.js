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
const PriceTickerService_1 = require("../../services/PriceTickerService");
const MessageException_1 = require("../../exceptions/MessageException");
let PriceTickerRootCommand = class PriceTickerRootCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, priceTickerService) {
        super(CommandEnumType_1.Commands.PRICETICKER_ROOT);
        this.Logger = Logger;
        this.priceTickerService = priceTickerService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     * [0] currecny
     *  .
     * [n] currency
     *
     * example: [ETH, BTC, XRP]
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<PriceTicker>>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length > 0) {
                // convert params to uppercase
                const currencies = [];
                for (const param of data.params) {
                    currencies.push(param.toUpperCase());
                }
                const returnData = yield this.priceTickerService.getPriceTickers(currencies);
                return returnData;
            }
            else {
                throw new MessageException_1.MessageException('Currency can\'t be blank');
            }
        });
    }
    usage() {
        return this.getName() + ' <currency> [currencies...]  -  ' + this.description();
    }
    help() {
        return this.usage() + '\n'
            + '    <currency>               - Currency. ';
    }
    description() {
        return 'Commands for managing PriceTicker.';
    }
    example() {
        return 'priceticker PART BTC';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], PriceTickerRootCommand.prototype, "execute", null);
PriceTickerRootCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.PriceTickerService)),
    tslib_1.__metadata("design:paramtypes", [Object, PriceTickerService_1.PriceTickerService])
], PriceTickerRootCommand);
exports.PriceTickerRootCommand = PriceTickerRootCommand;
//# sourceMappingURL=PriceTickerRootCommand.js.map