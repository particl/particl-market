"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const OrderService_1 = require("../../services/OrderService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const SearchOrder_1 = require("../../enums/SearchOrder");
let OrderSearchCommand = class OrderSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, orderService) {
        super(CommandEnumType_1.Commands.ORDER_SEARCH);
        this.Logger = Logger;
        this.orderService = orderService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: <itemhash>|*
     * [1]: (<status>|*)
     * [2]: (<buyerAddress>|*)
     * [3]: (<sellerAddress>|*)
     * [4]: <ordering>
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemHash = data.params[0] !== '*' ? data.params[0] : undefined;
            const status = data.params[1] !== '*' ? data.params[1] : undefined;
            const buyerAddress = data.params[2] !== '*' ? data.params[2] : undefined;
            const sellerAddress = data.params[3] !== '*' ? data.params[3] : undefined;
            let ordering = data.params[4];
            if (!ordering) {
                ordering = SearchOrder_1.SearchOrder.ASC;
            }
            const searchArgs = {
                listingItemHash,
                status,
                buyerAddress,
                sellerAddress,
                ordering
            };
            return yield this.orderService.search(searchArgs);
        });
    }
    usage() {
        return this.getName() + ' (<itemhash>|*) [(<status>|*) [(<buyerAddress>|*) [(<sellerAddress>|*) [<ordering>]]]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to search orders for. \n'
            + '                                A value of * specifies that any item hash is acceptable. \n'
            + '    <status>                 - [optional] ENUM{AWAITING_ESCROW,ESCROW_LOCKED,SHIPPING,COMPLETE} - \n'
            + '                                The status of the orders we want to search for \n'
            + '                                A value of * specifies that any order status is acceptable. \n'
            + '    <buyerAddress>           - [optional] String - The address of the buyer in the orders we want to search for. \n'
            + '                                A value of * specifies that any buyer address is acceptable. \n'
            + '    <sellerAddress>          - [optional] String - The address of the seller in the orders we want to search for. \n'
            + '                                A value of * specifies that any seller address is acceptable. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. ';
    }
    description() {
        return 'Search for orders by item hash, order status, or addresses. ';
    }
    example() {
        return 'TODO';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderSearchCommand.prototype, "execute", null);
OrderSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.OrderService)),
    tslib_1.__metadata("design:paramtypes", [Object, OrderService_1.OrderService])
], OrderSearchCommand);
exports.OrderSearchCommand = OrderSearchCommand;
//# sourceMappingURL=OrderSearchCommand.js.map