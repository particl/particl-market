"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const VoteService_1 = require("../../services/VoteService");
const ProfileService_1 = require("../../services/ProfileService");
const ProposalService_1 = require("../../services/ProposalService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("./../CommandEnumType");
const BaseCommand_1 = require("./../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const MessageException_1 = require("../../exceptions/MessageException");
let VoteGetCommand = class VoteGetCommand extends BaseCommand_1.BaseCommand {
    constructor(voteService, profileService, proposalService, Logger) {
        super(CommandEnumType_1.Commands.VOTE_GET);
        this.voteService = voteService;
        this.profileService = profileService;
        this.proposalService = proposalService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * command description
     * [0] profileId
     * [1] proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Expected <TODO> but received no params.');
            }
            // Get profile address from profile id
            const profileId = data.params.shift();
            const profileModel = yield this.profileService.findOne(profileId);
            const profile = profileModel.toJSON();
            // Get proposal id from proposal hash
            const proposalHash = data.params.shift();
            const proposal = yield this.proposalService.findOneByHash(proposalHash);
            const vote = yield this.voteService.findOneByVoterAndProposalId(profile.address, proposal.id)
                .catch(reason => {
                throw new MessageException_1.MessageException('User has not voted for that Proposal yet.');
            });
            return vote;
        });
    }
    help() {
        return this.getName() + ' <profileId> <proposalHash> ';
    }
    description() {
        return 'Get votes on a given proposal by a given submitter. ';
    }
    example() {
        return this.getName() + ' 1 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], VoteGetCommand.prototype, "execute", null);
VoteGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.VoteService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(3, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [VoteService_1.VoteService,
        ProfileService_1.ProfileService,
        ProposalService_1.ProposalService, Object])
], VoteGetCommand);
exports.VoteGetCommand = VoteGetCommand;
//# sourceMappingURL=VoteGetCommand.js.map