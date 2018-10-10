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
const ProfileService_1 = require("../../services/ProfileService");
const MarketService_1 = require("../../services/MarketService");
const ProposalActionService_1 = require("../../services/ProposalActionService");
const CoreRpcService_1 = require("../../services/CoreRpcService");
const ListingItemActionService_1 = require("../../services/ListingItemActionService");
const ItemVote_1 = require("../../enums/ItemVote");
const ProposalFactory_1 = require("../../factories/ProposalFactory");
const _ = require("lodash");
let ListingItemFlagCommand = class ListingItemFlagCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService, listingItemActionService, profileService, marketService, coreRpcService, proposalActionService, proposalFactory) {
        super(CommandEnumType_1.Commands.ITEM_FLAG);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.listingItemActionService = listingItemActionService;
        this.profileService = profileService;
        this.marketService = marketService;
        this.coreRpcService = coreRpcService;
        this.proposalActionService = proposalActionService;
        this.proposalFactory = proposalFactory;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listingItemHash
     *  [1]: profileId
     *  [2]: reason, optional
     *  [3]: expiryTime (from listingitem, set in validate)
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemHash = data.params.shift();
            const profileId = data.params.shift();
            const proposalDescription = data.params.shift();
            const daysRetention = data.params.shift(); // not perfect, but more than needed
            const optionsList = [ItemVote_1.ItemVote.KEEP, ItemVote_1.ItemVote.REMOVE];
            const proposalTitle = listingItemHash;
            // TODO: refactor these to startTime and endTime
            // TODO: When we're expiring by time not block make this listingItem.ExpiryTime();
            const blockStart = yield this.coreRpcService.getBlockCount();
            const blockEnd = blockStart + (daysRetention * 24 * 30);
            if (typeof blockStart !== 'number') {
                throw new MessageException_1.MessageException('blockStart needs to be a number.');
            }
            else if (typeof blockEnd !== 'number') {
                throw new MessageException_1.MessageException('blockEnd needs to be a number.');
            }
            const profileModel = yield this.profileService.findOne(profileId) // throws if not found
                .catch(reason => {
                this.log.error('ERROR:', reason);
                throw new MessageException_1.MessageException('Profile not found.');
            });
            const profile = profileModel.toJSON();
            // Get the default market.
            // TODO: We might want to let users specify this later.
            const marketModel = yield this.marketService.getDefault(); // throws if not found
            const market = marketModel.toJSON();
            return yield this.proposalActionService.send(proposalTitle, proposalDescription, blockStart, blockEnd, daysRetention, optionsList, profile, market, listingItemHash, false);
        });
    }
    /**
     * data.params[]:
     *  [0]: listingItemHash
     *  [1]: profileId
     *  [2]: reason, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Missing listingItemHash.');
            }
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing profileId.');
            }
            let listingItemModel;
            if (typeof data.params[0] === 'number') {
                throw new MessageException_1.MessageException('Invalid listingItemHash.');
            }
            else {
                listingItemModel = yield this.listingItemService.findOneByHash(data.params[0])
                    .catch(reason => {
                    throw new MessageException_1.MessageException('ListingItem not found.');
                });
            }
            const listingItem = listingItemModel.toJSON();
            // check if item is already flagged
            if (!_.isEmpty(listingItem.FlaggedItem)) {
                throw new MessageException_1.MessageException('Item is already flagged.');
            }
            // hash is what we need in execute()
            data.params[0] = listingItem.hash; // set to hash
            if (typeof data.params[1] !== 'number') {
                throw new MessageException_1.MessageException('profileId needs to be a number.');
            }
            else {
                // make sure profile with the id exists
                yield this.profileService.findOne(data.params[1]) // throws if not found
                    .catch(reason => {
                    this.log.error(reason);
                    throw new MessageException_1.MessageException('Profile not found.');
                });
            }
            data.params[2] = data.params.length === 3 ? data.params[2] : 'This ListingItem should be removed.';
            data.params[3] = listingItem.expiryTime;
            return data;
        });
    }
    usage() {
        return this.getName() + ' [<listingItemHash>] <profileId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemHash>  - String - The hash of the ListingItem we want to report. \n'
            + '    <profileId>        - Numeric - The ID of the Profile reporting the item.';
    }
    description() {
        return 'Report a ListingItem.';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemFlagCommand.prototype, "execute", null);
ListingItemFlagCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemActionService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ProposalActionService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Factory.ProposalFactory)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService,
        ListingItemActionService_1.ListingItemActionService,
        ProfileService_1.ProfileService,
        MarketService_1.MarketService,
        CoreRpcService_1.CoreRpcService,
        ProposalActionService_1.ProposalActionService,
        ProposalFactory_1.ProposalFactory])
], ListingItemFlagCommand);
exports.ListingItemFlagCommand = ListingItemFlagCommand;
//# sourceMappingURL=ListingItemFlagCommand.js.map