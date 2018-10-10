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
const VoteActionService_1 = require("../../services/VoteActionService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("./../CommandEnumType");
const BaseCommand_1 = require("./../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const ProfileService_1 = require("../../services/ProfileService");
const MarketService_1 = require("../../services/MarketService");
const MessageException_1 = require("../../exceptions/MessageException");
const ProposalService_1 = require("../../services/ProposalService");
let VotePostCommand = class VotePostCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, voteActionService, profileService, marketService, proposalService) {
        super(CommandEnumType_1.Commands.VOTE_POST);
        this.Logger = Logger;
        this.voteActionService = voteActionService;
        this.profileService = profileService;
        this.marketService = marketService;
        this.proposalService = proposalService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: proposalHash
     *  [2]: proposalOptionId
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profileId = data.params.shift();
            const proposalHash = data.params.shift();
            // TODO: for now we'll use optionId, we may need to change it later to be something else like hash
            const proposalOptionId = data.params.shift();
            const proposalModel = yield this.proposalService.findOneByHash(proposalHash)
                .catch(reason => {
                throw new MessageException_1.MessageException('Proposal not found.');
            });
            const proposal = proposalModel.toJSON();
            const proposalOption = _.find(proposal.ProposalOptions, (o) => {
                return o.optionId === proposalOptionId;
            });
            if (!proposalOption) {
                throw new MessageException_1.MessageException(`ProposalOption not found.`);
            }
            // Get profile from address.
            // Profile that is doing the bidding.
            const profileModel = yield this.profileService.findOne(profileId);
            if (!profileModel) {
                throw new MessageException_1.MessageException(`Profile with profileId <${profileId}> doesn't exist or doesn't belong to us.`);
            }
            const profile = profileModel.toJSON();
            // Get the default market.
            // TODO: Might want to let users specify this later.
            const marketModel = yield this.marketService.getDefault();
            if (!marketModel) {
                throw new MessageException_1.MessageException(`Default market doesn't exist!`);
            }
            const market = marketModel.toJSON();
            return yield this.voteActionService.send(proposal, proposalOption, profile, market);
        });
    }
    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: proposalHash
     *  [2]: proposalOptionId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 3) {
                throw new MessageException_1.MessageException('Missing params.');
            }
            if (typeof data.params[0] !== 'number') {
                throw new MessageException_1.MessageException('Invalid profileId.');
            }
            if (typeof data.params[1] !== 'string') {
                throw new MessageException_1.MessageException('Invalid proposalHash.');
            }
            if (typeof data.params[2] !== 'number') {
                throw new MessageException_1.MessageException('Invalid proposalOptionId.');
            }
            return data;
        });
    }
    help() {
        return this.getName() + ' <profileId> <proposalHash> <proposalOptionId> ';
    }
    description() {
        return 'Vote on a proposal specified via hash. ';
    }
    example() {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 0';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], VotePostCommand.prototype, "execute", null);
VotePostCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.VoteActionService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__metadata("design:paramtypes", [Object, VoteActionService_1.VoteActionService,
        ProfileService_1.ProfileService,
        MarketService_1.MarketService,
        ProposalService_1.ProposalService])
], VotePostCommand);
exports.VotePostCommand = VotePostCommand;
//# sourceMappingURL=VotePostCommand.js.map