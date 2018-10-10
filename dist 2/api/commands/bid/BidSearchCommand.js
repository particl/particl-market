"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const BidService_1 = require("../../services/BidService");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const SearchOrder_1 = require("../../enums/SearchOrder");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
const BidMessageType_1 = require("../../enums/BidMessageType");
const OrderStatus_1 = require("../../enums/OrderStatus");
let BidSearchCommand = class BidSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, bidService, listingItemService) {
        super(CommandEnumType_1.Commands.BID_SEARCH);
        this.Logger = Logger;
        this.bidService = bidService;
        this.listingItemService = listingItemService;
        this.DEFAULT_PAGE_LIMIT = 10;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: ListingItem hash, string, * for all, optional
     *  [4]: status/action, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}
     *       or ENUM{AWAITING_ESCROW, ESCROW_LOCKED, SHIPPING, COMPLETE}, * for all, optional
     *  [5]: searchString, string, * for anything, optional
     *  [6...]: bidder: particl address, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const page = data.params[0];
            const pageLimit = data.params[1];
            const ordering = data.params[2];
            const listingItemHash = data.params[3];
            const status = data.params[4];
            const searchString = data.params[5];
            // TODO: ordering is by createdAt, but perhaps updatedAt would be better
            // TODO: also maybe we should add support for bid expiry at some point
            if (data.params[6]) {
                // shift so that data.params contains only the bidders
                data.params.shift();
                data.params.shift();
                data.params.shift();
                data.params.shift();
                data.params.shift();
                data.params.shift();
            }
            else {
                // no bidders
                data.params = [];
            }
            const bidSearchParams = {
                page,
                pageLimit,
                ordering,
                listingItemHash,
                status,
                searchString,
                bidders: data.params
            };
            this.log.debug('bidSearchParams', bidSearchParams);
            return yield this.bidService.search(bidSearchParams);
        });
    }
    /**
     *
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: ListingItem hash, string, * for all, optional
     *  [4]: status/action, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}
     *       or ENUM{AWAITING_ESCROW, ESCROW_LOCKED, SHIPPING, COMPLETE}, * for all, optional
     *  [5]: searchString, string, * for anything, optional
     *  [6...]: bidder: particl address, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            data.params[0] = data.params[0] ? data.params[0] : 0;
            if (typeof data.params[0] !== 'number') {
                throw new MessageException_1.MessageException('parameter page should be a number.');
            }
            data.params[1] = data.params[1] ? data.params[1] : this.DEFAULT_PAGE_LIMIT;
            if (typeof data.params[0] !== 'number') {
                throw new MessageException_1.MessageException('parameter pageLimit should be a number.');
            }
            if (data.params[2] === 'ASC') {
                data.params[2] = SearchOrder_1.SearchOrder.ASC;
            }
            else {
                data.params[2] = SearchOrder_1.SearchOrder.DESC;
            }
            data.params[3] = data.params[3] !== '*' ? data.params[3] : undefined;
            data.params[4] = data.params[4] ? this.getStatus(data.params[4]) : undefined;
            data.params[5] = data.params[5] ? (data.params[5] !== '*' ? data.params[5] : undefined) : undefined;
            return data;
        });
    }
    usage() {
        return this.getName()
            + ' [<page> [<pageLimit> [<ordering> [<itemhash> [<status> [<searchString> [<bidderAddress> ...]]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of search listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. \n'
            + '    <itemhash>               - String - The hash of the item we want to search bids for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <status>                 - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                             - or ENUM{AWAITING_ESCROW, ESCROW_LOCKED, SHIPPING, COMPLETE} - \n'
            + '                                The status of the bids or status of the orderItem we want to search for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <searchString>           - [optional] String - A string that is used to \n'
            + '                                find bids related to listing items by their titles and descriptions. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <bidderAddress>          - [optional] String(s) - The addresses of the bidders we want to search bids for. ';
    }
    description() {
        return 'Search Bids by item hash, bid status, or bidder address';
    }
    example() {
        return 'bid ' + this.getName() + ' a22c63bc16652bc417068754688e50f60dbf2ce6d599b4ccf800d63b504e0a88'
            + ' MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }
    getStatus(status) {
        switch (status) {
            case 'MPA_BID':
                return BidMessageType_1.BidMessageType.MPA_BID;
            case 'MPA_ACCEPT':
                return BidMessageType_1.BidMessageType.MPA_ACCEPT;
            case 'MPA_REJECT':
                return BidMessageType_1.BidMessageType.MPA_REJECT;
            case 'MPA_CANCEL':
                return BidMessageType_1.BidMessageType.MPA_CANCEL;
            case 'AWAITING_ESCROW':
                return OrderStatus_1.OrderStatus.AWAITING_ESCROW;
            case 'ESCROW_LOCKED':
                return OrderStatus_1.OrderStatus.ESCROW_LOCKED;
            case 'SHIPPING':
                return OrderStatus_1.OrderStatus.SHIPPING;
            case 'COMPLETE':
                return OrderStatus_1.OrderStatus.COMPLETE;
            case '*':
                return undefined;
            default:
                throw new MessageException_1.MessageException('Invalid status.');
        }
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