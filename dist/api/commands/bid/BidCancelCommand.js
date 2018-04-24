"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const ListingItemService_1 = require("../../services/ListingItemService");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const BidActionService_1 = require("../../services/BidActionService");
let BidCancelCommand = class BidCancelCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, bidActionService) {
        super(CommandEnumType_1.Commands.BID_CANCEL);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.bidActionService = bidActionService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: itemhash, string
     * [1]: bidId
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 2) {
                this.log.error('Requires two args');
                throw new MessageException_1.MessageException('Requires two args');
            }
            const itemHash = data.params[0];
            const bidId = data.params[1];
            // find listingItem by hash
            const listingItemModel = yield this.listingItemService.findOneByHash(itemHash);
            const listingItem = listingItemModel.toJSON();
            // find the bid
            const bids = listingItem.Bids;
            const bidToCancel = _.find(bids, (bid) => {
                return bid.id === bidId;
            });
            if (!bidToCancel) {
                throw new MessageException_1.MessageException('Bid not found.');
            }
            return this.bidActionService.cancel(listingItem, bidToCancel);
        });
    }
    usage() {
        return this.getName() + ' <itemhash> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item whose bid we want to cancel. '
            + '    <bidId>                  - Numeric - The ID of the bid we want to cancel. ';
    }
    description() {
        return 'Cancel bid.';
    }
    example() {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidCancelCommand.prototype, "execute", null);
BidCancelCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.BidActionService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        BidActionService_1.BidActionService])
], BidCancelCommand);
exports.BidCancelCommand = BidCancelCommand;
//# sourceMappingURL=BidCancelCommand.js.map