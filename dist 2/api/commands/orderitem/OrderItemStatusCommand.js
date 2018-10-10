"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
const SearchOrder_1 = require("../../enums/SearchOrder");
const OrderItemStatus_1 = require("../../../core/helpers/OrderItemStatus");
let OrderItemStatusCommand = class OrderItemStatusCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService) {
        super(CommandEnumType_1.Commands.ORDERITEM_STATUS);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: itemhash, string
     *  [1]: buyer, string
     *  [2]: seller, string
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemHash = data.params[0];
            const buyer = data.params[1];
            const seller = data.params[2];
            const type = 'ALL'; // todo: use * instead of ALL
            const profileId = 'ALL'; // todo: use * instead of ALL
            // search for listingitem(s) with certain seller and having bids from certain buyer
            const listingItemsModel = yield this.listingItemService.search({
                itemHash,
                buyer,
                seller,
                order: SearchOrder_1.SearchOrder.ASC.toString(),
                type,
                profileId,
                searchString: '',
                page: 0,
                pageLimit: 100,
                withBids: true
            }, true);
            const listingItems = listingItemsModel.toJSON();
            // this.log.debug('listingItems:', JSON.stringify(listingItems, null, 2));
            // Extract status details from the orderItems, since that's what we want to return to the userd
            const orderItemStatuses = [];
            for (const listingItem of listingItems) {
                for (const bid of listingItem.Bids) {
                    if (!buyer || buyer === '*' || bid.bidder === buyer) {
                        const orderItemStatus = new OrderItemStatus_1.OrderItemStatus(listingItem.hash, bid.action, bid.OrderItem.status, bid.bidder, listingItem.seller);
                        orderItemStatuses.push(orderItemStatus);
                    }
                }
            }
            this.log.debug('orderItemStatuses:', JSON.stringify(orderItemStatuses, null, 2));
            return orderItemStatuses;
        });
    }
    /**
     *  [0]: itemhash | *, string
     *  [1]: buyer | *, string
     *  [2]: seller | *, string
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                data.params[0] = '*';
            }
            if (data.params.length < 2) {
                data.params[1] = '*';
            }
            if (data.params.length < 3) {
                data.params[2] = '*';
            }
            const itemHash = data.params[0];
            const buyer = data.params[1];
            const seller = data.params[2];
            if (typeof itemHash !== 'string') {
                throw new MessageException_1.MessageException('itemHash should be a string.');
            }
            if (typeof buyer !== 'string') {
                throw new MessageException_1.MessageException('buyer should be a string.');
            }
            if (typeof seller !== 'string') {
                throw new MessageException_1.MessageException('seller should be a string.');
            }
            return data;
        });
    }
    // tslint:disable:max-line-length
    usage() {
        return this.getName() + ' [<itemhash|*> [<buyer|*> [<seller|*>]]]';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '<itemHash|*> - The hash of the OrderItem we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<buyer|*>    - The buyer of the OrderItems we want to get the status of. \n'
            + '               Can use * for wildcard. \n'
            + '<seller|*>   - The seller of the OrderItems we want to get the status of. \n'
            + '               Can use * for wildcard. \n';
    }
    // tslint:enable:max-line-length
    description() {
        return 'Fetch statuses of OrderItems specified by given search params. Shows the first 100 orders.';
    }
    example() {
        return 'orderitem ' + this.getName() + ' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderItemStatusCommand.prototype, "execute", null);
OrderItemStatusCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService])
], OrderItemStatusCommand);
exports.OrderItemStatusCommand = OrderItemStatusCommand;
//# sourceMappingURL=OrderItemStatusCommand.js.map