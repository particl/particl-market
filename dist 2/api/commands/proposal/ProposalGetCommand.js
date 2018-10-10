"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ProposalService_1 = require("../../services/ProposalService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("./../CommandEnumType");
const BaseCommand_1 = require("./../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const MessageException_1 = require("../../exceptions/MessageException");
let ProposalGetCommand = class ProposalGetCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, proposalService) {
        super(CommandEnumType_1.Commands.PROPOSAL_GET);
        this.Logger = Logger;
        this.proposalService = proposalService;
        this.log = new Logger(__filename);
    }
    /**
     * command description
     * [0] proposalHash
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const proposalHash = data.params[0];
            return yield this.proposalService.findOneByHash(proposalHash, true);
        });
    }
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 1) {
                throw new MessageException_1.MessageException('Expected proposalHash but received no params.');
            }
            return data;
        });
    }
    help() {
        return this.getName() + ' <proposalHash> ';
    }
    description() {
        return 'Get a proposal by its hash. ';
    }
    example() {
        return this.getName() + ' 392fc0687405099ad71319686aa421b65e262f10f9c2caed181ae81d23d52236 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalGetCommand.prototype, "execute", null);
ProposalGetCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProposalService_1.ProposalService])
], ProposalGetCommand);
exports.ProposalGetCommand = ProposalGetCommand;
//# sourceMappingURL=ProposalGetCommand.js.map