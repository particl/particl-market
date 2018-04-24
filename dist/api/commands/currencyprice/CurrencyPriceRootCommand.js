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
const CurrencyPriceService_1 = require("../../services/CurrencyPriceService");
const MessageException_1 = require("../../exceptions/MessageException");
let CurrencyPriceRootCommand = class CurrencyPriceRootCommand extends BaseCommand_1.BaseCommand {
    constructor(currencyPriceService, Logger) {
        super(CommandEnumType_1.Commands.CURRENCYPRICE_ROOT);
        this.currencyPriceService = currencyPriceService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: fromCurrency
     * [1]: toCurrency
     * [...]: toCurrency
     *
     * description: fromCurrency must be PART for now and toCurrency may be multiple currencies like INR, USD etc..
     * example: [PART, INR, USD, EUR, GBP, ....]
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<"resources".CurrencyPrice[]>}
     *
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: better errors
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Invalid params');
            }
            const fromCurrency = data.params.shift().toUpperCase();
            // throw exception if fromCurrency is not a PART or toCurrencies has length 0
            if (fromCurrency !== 'PART') {
                throw new MessageException_1.MessageException('Invalid params');
            }
            else {
                // convert params to uppercase
                const toCurrencies = [];
                for (const param of data.params) {
                    toCurrencies.push(param.toUpperCase());
                }
                return yield this.currencyPriceService.getCurrencyPrices(fromCurrency, toCurrencies);
            }
        });
    }
    usage() {
        return this.getName() + ' <from> <to> [to...])  -  ' + this.description();
    }
    help() {
        return this.usage() + '\n'
            + '    <from>                   - Currency name from which you want to convert. \n'
            + '    <to>                     - Currency name in which you want to convert. ';
    }
    description() {
        return 'Command to convert currencies.';
    }
    example() {
        return 'currencyprice PART EUR USD';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], CurrencyPriceRootCommand.prototype, "execute", null);
CurrencyPriceRootCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.CurrencyPriceService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [CurrencyPriceService_1.CurrencyPriceService, Object])
], CurrencyPriceRootCommand);
exports.CurrencyPriceRootCommand = CurrencyPriceRootCommand;
//# sourceMappingURL=CurrencyPriceRootCommand.js.map