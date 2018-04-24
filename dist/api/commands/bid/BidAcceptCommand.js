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
let BidAcceptCommand = class BidAcceptCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, bidActionService) {
        super(CommandEnumType_1.Commands.BID_ACCEPT);
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
            this.log.debug('data.params:', JSON.stringify(data.params, null, 2));
            const itemHash = data.params[0];
            const bidId = data.params[1];
            // find listingItem by hash
            const listingItemModel = yield this.listingItemService.findOneByHash(itemHash);
            const listingItem = listingItemModel.toJSON();
            this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
            // make sure we have a ListingItemTemplate, so we know it's our item
            if (_.isEmpty(listingItem.ListingItemTemplate)) {
                this.log.error('Not your item.'); // Added for Unit Tests
                throw new MessageException_1.MessageException('Not your item.');
            }
            // find the bid
            const bids = listingItem.Bids;
            const bidToAccept = bids.find(bid => {
                return bid.id === bidId;
            });
            if (!bidToAccept) {
                this.log.error('Bid not found.'); // Added for Unit Tests
                throw new MessageException_1.MessageException('Bid not found.');
            }
            return this.bidActionService.accept(listingItem, bidToAccept);
        });
    }
    usage() {
        return this.getName() + ' <itemhash> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to accept. ';
    }
    description() {
        return 'Accept bid.';
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
], BidAcceptCommand.prototype, "execute", null);
BidAcceptCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.BidActionService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        BidActionService_1.BidActionService])
], BidAcceptCommand);
exports.BidAcceptCommand = BidAcceptCommand;
//# sourceMappingURL=BidAcceptCommand.js.map