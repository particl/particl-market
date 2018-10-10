"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const _ = require("lodash");
const RpcRequest_1 = require("../../requests/RpcRequest");
const SearchOrder_1 = require("../../enums/SearchOrder");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
const SmsgMessageService_1 = require("../../services/SmsgMessageService");
let SmsgSearchCommand = class SmsgSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, smsgMessageService) {
        super(CommandEnumType_1.Commands.SMSG_SEARCH);
        this.Logger = Logger;
        this.smsgMessageService = smsgMessageService;
        this.DEFAULT_PAGE_LIMIT = 10;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: type, MessageTypeEnum, * for all, optional
     *  [4]: status, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [5]: smsgid, string, * for all, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const searchParams = this.getSearchParams(data.params);
            return yield this.smsgMessageService.searchBy(searchParams);
        });
    }
    usage() {
        return this.getName()
            + ' [<page> [<pageLimit> [<ordering> [<type> [<status> [<msgid>]]]]]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of search listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. \n'
            + '    <type>                   - [optional] ENUM{ASC,DESC} - MessageType. \n'
            + '    <status>                 - [optional] ENUM{ASC,DESC} - SmsgMessageStatus. \n'
            + '    <msgid>                  - [optional] ENUM{ASC,DESC} - The message msgid. \n';
    }
    description() {
        return 'Search bids by itemhash, bid status, or bidder address';
    }
    example() {
        return 'bid ' + this.getName() + ' TODO';
    }
    /**
     * data.params[]:
     *  [0]: page, number, optional
     *  [1]: pageLimit, number, default=10, optional
     *  [2]: ordering ASC/DESC, orders by createdAt, optional
     *  [3]: type, MessageTypeEnum, * for all, optional
     *  [4]: status, ENUM{NEW, PARSING_FAILED, PROCESSING, PROCESSED, PROCESSING_FAILED, WAITING}, * for all
     *  [5]: smsgid, string, * for all, optional
     *
     * @param {any[]} params
     * @returns {SmsgMessageSearchParams}
     */
    getSearchParams(params) {
        let page = 0;
        let pageLimit = this.DEFAULT_PAGE_LIMIT;
        let ordering = SearchOrder_1.SearchOrder.ASC;
        let types = [];
        let status;
        let msgid;
        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'number') {
                throw new MessageException_1.MessageException('page should be a number.');
            }
            else {
                page = params.shift();
            }
        }
        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'number') {
                throw new MessageException_1.MessageException('pageLimit should be a number.');
            }
            else {
                pageLimit = params.shift();
            }
        }
        if (!_.isEmpty(params)) {
            if (typeof params[0] !== 'string') {
                throw new MessageException_1.MessageException('ordering should be a string.');
            }
            else {
                if (params[0] === 'DESC') {
                    ordering = SearchOrder_1.SearchOrder.DESC;
                }
                else {
                    ordering = SearchOrder_1.SearchOrder.ASC;
                }
                params.shift();
            }
        }
        if (!_.isEmpty(params)) {
            types = [params.shift()];
        }
        if (!_.isEmpty(params)) {
            status = params.shift();
        }
        if (!_.isEmpty(params)) {
            msgid = params.shift();
        }
        const searchParams = {
            page,
            pageLimit,
            order: ordering,
            orderByColumn: 'received',
            types,
            status,
            msgid,
            age: 1000 * 30
        };
        this.log.debug('SmsgMessageSearchParams: ', JSON.stringify(searchParams, null, 2));
        return searchParams;
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], SmsgSearchCommand.prototype, "execute", null);
SmsgSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__metadata("design:paramtypes", [Object, SmsgMessageService_1.SmsgMessageService])
], SmsgSearchCommand);
exports.SmsgSearchCommand = SmsgSearchCommand;
//# sourceMappingURL=SmsgSearchCommand.js.map