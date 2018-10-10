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
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("./../CommandEnumType");
const BaseCommand_1 = require("./../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
let VoteListCommand = class VoteListCommand extends BaseCommand_1.BaseCommand {
    constructor(voteService, Logger) {
        super(CommandEnumType_1.Commands.VOTE_LIST);
        this.voteService = voteService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * List votes
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.voteService.findAll();
        });
    }
    help() {
        return this.getName() + ' ';
    }
    description() {
        return 'List votes. ';
    }
    example() {
        return this.getName() + ' ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], VoteListCommand.prototype, "execute", null);
VoteListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.VoteService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [VoteService_1.VoteService, Object])
], VoteListCommand);
exports.VoteListCommand = VoteListCommand;
//# sourceMappingURL=VoteListCommand.js.map