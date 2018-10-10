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
const CommandEnumType_1 = require("./../CommandEnumType");
const BaseCommand_1 = require("./../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const MessageException_1 = require("../../exceptions/MessageException");
const ProposalActionService_1 = require("../../services/ProposalActionService");
const ProfileService_1 = require("../../services/ProfileService");
const MarketService_1 = require("../../services/MarketService");
const ProposalType_1 = require("../../enums/ProposalType");
let ProposalPostCommand = class ProposalPostCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, proposalActionService, profileService, marketService) {
        super(CommandEnumType_1.Commands.PROPOSAL_POST);
        this.Logger = Logger;
        this.proposalActionService = proposalActionService;
        this.profileService = profileService;
        this.marketService = marketService;
        this.log = new Logger(__filename);
    }
    /**
     * command description
     * [0] profileId
     * [1] proposalTitle
     * [2] proposalDescription
     * [3] blockStart TODO: blockStart and blockEnd should be replaced with daysRetention
     * [4] blockEnd
     * [5] estimateFee
     * [6] option1Description
     * [n...] optionNDescription
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo add validation in separate function..
            if (data.params.length < 8) {
                throw new MessageException_1.MessageException('Expected more params.');
            }
            const type = ProposalType_1.ProposalType.PUBLIC_VOTE;
            const profileId = data.params.shift();
            const proposalTitle = data.params.shift();
            const proposalDescription = data.params.shift();
            const blockStart = data.params.shift();
            const blockEnd = data.params.shift();
            const estimateFee = data.params.shift();
            if (typeof profileId !== 'number') {
                throw new MessageException_1.MessageException('profileId needs to be a number.');
            }
            else if (typeof blockStart !== 'number') {
                throw new MessageException_1.MessageException('blockStart needs to be a number.');
            }
            else if (typeof blockEnd !== 'number') {
                throw new MessageException_1.MessageException('blockEnd needs to be a number.');
            }
            else if (typeof estimateFee !== 'boolean') {
                throw new MessageException_1.MessageException('estimateFee needs to be a boolean.');
            }
            let profile;
            try {
                const profileModel = yield this.profileService.findOne(profileId);
                profile = profileModel.toJSON();
            }
            catch (ex) {
                this.log.error(ex);
                throw new MessageException_1.MessageException('Profile not found.');
            }
            // Get the default market.
            // TODO: Might want to let users specify this later.
            let market;
            const marketModel = yield this.marketService.getDefault();
            if (!marketModel) {
                throw new MessageException_1.MessageException(`Default market doesn't exist!`);
            }
            market = marketModel.toJSON();
            // rest of the data.params are option descriptions
            const optionsList = data.params;
            // todo: get rid of the blocks
            const daysRetention = Math.ceil((blockEnd - blockStart) / (24 * 30));
            return yield this.proposalActionService.send(proposalTitle, proposalDescription, blockStart, blockEnd, daysRetention, optionsList, profile, market, null, estimateFee);
        });
    }
    usage() {
        return this.getName() + ' <profileId> <proposalTitle> <proposalDescription> <blockStart> <blockEnd> <estimateFee> '
            + '<option1Description> ... <optionNDescription> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - number, ID of the Profile. \n'
            + '    <proposalTitle>          - string, Title for the Proposal. \n'
            + '    <proposalDescription>    - string, Description for the Proposal. \n'
            + '    <blockStart>             - number, Start Block for the Voting. \n'
            + '    <blockEnd>               - number, End Block for the Voting. \n'
            + '    <estimateFee>            - boolean, Just estimate the Fee, dont post the Proposal. \n'
            + '    <optionNDescription>     - string, ProposalOption description. ';
    }
    description() {
        return ' Post a proposal.';
    }
    example() {
        return this.getName() + ' proposal post 1 "A question of sets" "The set of all sets contains itself?" 0 1000000 YES NO';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalPostCommand.prototype, "execute", null);
ProposalPostCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProposalActionService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProposalActionService_1.ProposalActionService,
        ProfileService_1.ProfileService,
        MarketService_1.MarketService])
], ProposalPostCommand);
exports.ProposalPostCommand = ProposalPostCommand;
//# sourceMappingURL=ProposalPostCommand.js.map