"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const _ = require("lodash");
const constants_1 = require("../../../constants");
const ProposalService_1 = require("../../services/ProposalService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const RpcCommandFactory_1 = require("../../factories/RpcCommandFactory");
const MessageException_1 = require("../../exceptions/MessageException");
const SearchOrder_1 = require("../../enums/SearchOrder");
const ProposalType_1 = require("../../enums/ProposalType");
let ProposalListCommand = class ProposalListCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, proposalService) {
        super(CommandEnumType_1.Commands.PROPOSAL_LIST);
        this.Logger = Logger;
        this.proposalService = proposalService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0] startBlock | *, optional
     * [1] endBlock | *, optional
     * [2] type, optional
     * [3] order, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data, rpcCommandFactory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searchParams = {
                startBlock: data.params[0],
                endBlock: data.params[1],
                type: data.params[2],
                order: data.params[3]
            };
            return yield this.proposalService.searchBy(searchParams, true);
        });
    }
    /**
     *
     * list * 100 -> return all proposals which ended before block 100
     * list 100 * -> return all proposals ending after block 100
     * list 100 200 -> return all which are active and closed between 100 200
     *
     * data.params[]:
     * [0] startBlock | *, optional
     * [1] endBlock | *, optional
     * [2] order, optional
     * [3] type, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let order = SearchOrder_1.SearchOrder.ASC;
            let type;
            let startBlock = '*';
            let endBlock = '*';
            if (!_.isEmpty(data.params)) {
                startBlock = data.params.shift();
                if (typeof startBlock === 'string' && startBlock !== '*') {
                    throw new MessageException_1.MessageException('startBlock must be a number or *.');
                }
            }
            if (!_.isEmpty(data.params)) {
                endBlock = data.params.shift();
                if (typeof endBlock === 'string' && endBlock !== '*') {
                    throw new MessageException_1.MessageException('endBlock must be a number or *.');
                }
            }
            if (!_.isEmpty(data.params)) {
                type = data.params.shift();
                if (type.toUpperCase() === ProposalType_1.ProposalType.ITEM_VOTE.toString()) {
                    type = ProposalType_1.ProposalType.ITEM_VOTE;
                }
                else if (type.toUpperCase() === ProposalType_1.ProposalType.PUBLIC_VOTE.toString()) {
                    type = ProposalType_1.ProposalType.PUBLIC_VOTE;
                }
                else {
                    // anything goes
                }
            }
            else {
                type = ProposalType_1.ProposalType.PUBLIC_VOTE; // default
            }
            if (!_.isEmpty(data.params)) {
                order = data.params.shift();
                if (order.toUpperCase() === SearchOrder_1.SearchOrder.DESC.toString()) {
                    order = SearchOrder_1.SearchOrder.DESC;
                }
                else {
                    order = SearchOrder_1.SearchOrder.ASC;
                }
            }
            else {
                order = SearchOrder_1.SearchOrder.ASC; // default
            }
            data.params = [];
            data.params[0] = startBlock;
            data.params[1] = endBlock;
            data.params[2] = type;
            data.params[3] = order;
            return data;
        });
    }
    help() {
        return this.getName() + ' <startBlock> <endBlock> <type> <order> ';
    }
    description() {
        return 'Command for retrieving proposals. ';
    }
    example() {
        return this.getName() + ' 1 100000000 ITEM_VOTE ASC ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest, RpcCommandFactory_1.RpcCommandFactory]),
    tslib_1.__metadata("design:returntype", Promise)
], ProposalListCommand.prototype, "execute", null);
ProposalListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ProposalService)),
    tslib_1.__metadata("design:paramtypes", [Object, ProposalService_1.ProposalService])
], ProposalListCommand);
exports.ProposalListCommand = ProposalListCommand;
//# sourceMappingURL=ProposalListCommand.js.map