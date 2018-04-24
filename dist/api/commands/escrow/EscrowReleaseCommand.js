"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const EscrowActionService_1 = require("../../services/EscrowActionService");
const EscrowMessageType_1 = require("../../enums/EscrowMessageType");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const _ = require("lodash");
const MessageException_1 = require("../../exceptions/MessageException");
const OrderStatus_1 = require("../../enums/OrderStatus");
const BidMessageType_1 = require("../../enums/BidMessageType");
const OrderItemService_1 = require("../../services/OrderItemService");
let EscrowReleaseCommand = class EscrowReleaseCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, escrowActionService, orderItemService) {
        super(CommandEnumType_1.Commands.ESCROW_RELEASE);
        this.Logger = Logger;
        this.escrowActionService = escrowActionService;
        this.orderItemService = orderItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: memo
     *
     * @param data
     * @returns {Promise<any>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderItemModel = yield this.orderItemService.findOne(data.params[0]);
            const orderItem = orderItemModel.toJSON();
            const valid = [
                OrderStatus_1.OrderStatus.ESCROW_LOCKED,
                OrderStatus_1.OrderStatus.SHIPPING
            ];
            // check if in the right state.
            if (valid.indexOf(orderItem.status) === -1) {
                this.log.error('Order is in invalid state');
                throw new MessageException_1.MessageException('Order is in invalid state');
            }
            const bid = orderItem.Bid;
            if (!bid || bid.action !== BidMessageType_1.BidMessageType.MPA_ACCEPT) {
                this.log.error('No valid information to finalize escrow');
                throw new MessageException_1.MessageException('No valid information to finalize escrow');
            }
            const listingItem = orderItem.Bid.ListingItem;
            if (_.isEmpty(listingItem)) {
                this.log.error('ListingItem not found!');
                throw new MessageException_1.MessageException('ListingItem not found!');
            }
            const paymentInformation = orderItem.Bid.ListingItem.PaymentInformation;
            if (_.isEmpty(paymentInformation)) {
                this.log.error('PaymentInformation not found!');
                throw new MessageException_1.MessageException('PaymentInformation not found!');
            }
            const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
            if (_.isEmpty(escrow)) {
                this.log.error('Escrow not found!');
                throw new MessageException_1.MessageException('Escrow not found!');
            }
            const escrowRatio = orderItem.Bid.ListingItem.PaymentInformation.Escrow.Ratio;
            if (_.isEmpty(escrowRatio)) {
                this.log.error('EscrowRatio not found!');
                throw new MessageException_1.MessageException('EscrowRatio not found!');
            }
            return this.escrowActionService.release({
                orderItem,
                memo: data.params[1],
                action: EscrowMessageType_1.EscrowMessageType.MPA_RELEASE
            });
        });
    }
    usage() {
        return this.getName() + ' [<itemhash> [<memo>]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to release the Escrow.\n'
            + '    <memo>                   - String - The memo of the Escrow ';
    }
    description() {
        return 'Release an escrow.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], EscrowReleaseCommand.prototype, "execute", null);
EscrowReleaseCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.EscrowActionService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.OrderItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, EscrowActionService_1.EscrowActionService,
        OrderItemService_1.OrderItemService])
], EscrowReleaseCommand);
exports.EscrowReleaseCommand = EscrowReleaseCommand;
//# sourceMappingURL=EscrowReleaseCommand.js.map