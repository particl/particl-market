"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
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
const BidService_1 = require("../../services/BidService");
let BidAcceptCommand = class BidAcceptCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, bidService, bidActionService) {
        super(CommandEnumType_1.Commands.BID_ACCEPT);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.bidService = bidService;
        this.bidActionService = bidActionService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: bidId
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidId = data.params[0];
            const bid = yield this.bidService.findOne(bidId)
                .then(value => {
                return value.toJSON();
            });
            return this.bidActionService.accept(bid);
        });
    }
    /**
     * data.params[]:
     * [0]: bidId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Missing bidId.');
            }
            if (typeof data.params[0] !== 'number') {
                throw new MessageException_1.MessageException('bidId should be a number.');
            }
            const bidId = data.params[0];
            const bid = yield this.bidService.findOne(bidId)
                .then(value => {
                return value.toJSON();
            });
            // make sure ListingItem exists
            if (_.isEmpty(bid.ListingItem)) {
                this.log.error('ListingItem not found.');
                throw new MessageException_1.MessageException('ListingItem not found.');
            }
            // make sure we have a ListingItemTemplate, so we know it's our item
            if (_.isEmpty(bid.ListingItem.ListingItemTemplate)) {
                this.log.error('Not your ListingItem.');
                throw new MessageException_1.MessageException('Not your ListingItem.');
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' <bidId>';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <bidId>                  - number - The id of the item we want to accept. ';
    }
    description() {
        return 'Accept bid.';
    }
    example() {
        return 'bid ' + this.getName() + ' 1';
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
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.BidService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.BidActionService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        BidService_1.BidService,
        BidActionService_1.BidActionService])
], BidAcceptCommand);
exports.BidAcceptCommand = BidAcceptCommand;
//# sourceMappingURL=BidAcceptCommand.js.map