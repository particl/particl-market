"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const _ = require("lodash");
const BidService_1 = require("../../services/BidService");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const SearchOrder_1 = require("../../enums/SearchOrder");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
const BidMessageType_1 = require("../../enums/BidMessageType");
let BidSearchCommand = class BidSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, bidService, listingItemService) {
        super(CommandEnumType_1.Commands.BID_SEARCH);
        this.Logger = Logger;
        this.bidService = bidService;
        this.listingItemService = listingItemService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     * [0]: ListingItem hash, string, * for all
     * [1]: status/action, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}, * for all
     * [2]: ordering ASC/DESC, orders by createdAt
     * [3...]: bidder: particl address
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemHash = data.params[0] !== '*' ? data.params[0] : undefined;
            const action = data.params[1] !== '*' ? data.params[1] : undefined;
            const ordering = data.params[2] ? data.params[2] : SearchOrder_1.SearchOrder.ASC;
            // TODO: ordering is by createdAt, but perhaps updatedAt would be better
            if (data.params.length >= 3) {
                // shift so that data.params contains only the bidders
                data.params.shift();
                data.params.shift();
                data.params.shift();
            }
            else {
                // no bidders
                data.params = [];
            }
            const bidSearchParams = {
                listingItemHash,
                action,
                ordering,
                bidders: data.params
            };
            this.log.debug('bidSearchParams', bidSearchParams);
            if (!_.includes([
                BidMessageType_1.BidMessageType.MPA_BID,
                BidMessageType_1.BidMessageType.MPA_ACCEPT,
                BidMessageType_1.BidMessageType.MPA_REJECT,
                BidMessageType_1.BidMessageType.MPA_CANCEL,
                undefined
            ], bidSearchParams.action)) {
                throw new MessageException_1.MessageException('Invalid BidMessageType: ' + bidSearchParams.action);
            }
            if (!_.includes([
                SearchOrder_1.SearchOrder.ASC,
                SearchOrder_1.SearchOrder.DESC
            ], bidSearchParams.ordering)) {
                throw new MessageException_1.MessageException('Invalid SearchOrder: ' + bidSearchParams.ordering);
            }
            return yield this.bidService.search(bidSearchParams);
        });
    }
    usage() {
        return this.getName() + ' <itemhash>|*> [status>|* [ordering [<bidderAddress...]]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to search bids for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <status>                 - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                                The status of the bids we want to search for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. \n'
            + '    <bidderAddress>          - [optional] String(s) - The address of the bidder we want to search bids for. ';
    }
    description() {
        return 'Search bids by itemhash, bid status, or bidder address';
    }
    example() {
        return 'bid ' + this.getName() + ' a22c63bc16652bc417068754688e50f60dbf2ce6d599b4ccf800d63b504e0a88'
            + ' MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], BidSearchCommand.prototype, "execute", null);
BidSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.BidService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, BidService_1.BidService,
        ListingItemService_1.ListingItemService])
], BidSearchCommand);
exports.BidSearchCommand = BidSearchCommand;
//# sourceMappingURL=BidSearchCommand.js.map