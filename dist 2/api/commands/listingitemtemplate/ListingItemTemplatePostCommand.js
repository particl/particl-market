"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const ListingItemActionService_1 = require("../../services/ListingItemActionService");
const MessageException_1 = require("../../exceptions/MessageException");
const MarketService_1 = require("../../services/MarketService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
let ListingItemTemplatePostCommand = class ListingItemTemplatePostCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemActionService, marketService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.TEMPLATE_POST);
        this.Logger = Logger;
        this.listingItemActionService = listingItemActionService;
        this.marketService = marketService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: marketId
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplateId = data.params[0];
            const daysRetention = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
            const marketId = data.params[2] || undefined;
            const postRequest = {
                listingItemTemplateId,
                daysRetention,
                marketId
            };
            const response = yield this.listingItemActionService.post(postRequest);
            this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
            return response;
        });
    }
    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: marketId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Missing listingItemTemplateId.');
            }
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing daysRetention.');
            }
            if (data.params.length < 3) {
                throw new MessageException_1.MessageException('Missing marketId.');
            }
            const listingItemTemplateId = data.params[0];
            const daysRetention = data.params[1];
            const marketId = data.params[2];
            if (listingItemTemplateId && typeof listingItemTemplateId !== 'number') {
                throw new MessageException_1.MessageException('listingItemTemplateId should be a number.');
            }
            else {
                // make sure template with the id exists
                yield this.listingItemTemplateService.findOne(listingItemTemplateId); // throws if not found
            }
            if (daysRetention && typeof daysRetention !== 'number') {
                throw new MessageException_1.MessageException('daysRetention should be a number.');
            }
            if (marketId && typeof marketId !== 'number') {
                throw new MessageException_1.MessageException('marketId should be a number.');
            }
            else {
                // make sure market with the id exists
                yield this.marketService.findOne(marketId); // throws if not found
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' <listingTemplateId> [daysRetention] [marketId] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Number - The ID of the listing item template that we want to post. \n'
            + '    <daysRetention>               - [optional] Number - Days the listing will be retained by network.\n'
            + '    <marketId>                    - [optional] Number - Market id. ';
    }
    description() {
        return 'Post the ListingItemTemplate to the Marketplace.';
    }
    example() {
        return 'template ' + this.getName() + ' 1 1';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplatePostCommand.prototype, "execute", null);
ListingItemTemplatePostCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemActionService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemActionService_1.ListingItemActionService,
        MarketService_1.MarketService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ListingItemTemplatePostCommand);
exports.ListingItemTemplatePostCommand = ListingItemTemplatePostCommand;
//# sourceMappingURL=ListingItemTemplatePostCommand.js.map