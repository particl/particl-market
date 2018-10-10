"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
let ListingItemTemplateSearchCommand = class ListingItemTemplateSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.TEMPLATE_SEARCH);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: profile id
     *  [4]: category, number|string, if string, try to search using key, optional
     *  [5]: searchString, string, optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.listingItemTemplateService.search({
                page: data.params[0] || 0,
                pageLimit: data.params[1] || 10,
                order: data.params[2] || 'ASC',
                profileId: data.params[3],
                category: data.params[4],
                searchString: data.params[5] || ''
            });
        });
    }
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 4) {
                throw new MessageException_1.MessageException('Missing parameters.');
            }
            // TODO:
            // - is order valid?
            // - profile exists?
            // - category exists?
            return data;
        });
    }
    usage() {
        return this.getName() + ' <page> <pageLimit> <order> <profileId> [<categoryName> [<searchString>]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - Numeric - The number page we want to view of search \n'
            + '                                listing item template results. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - ENUM{ASC} - The order of the returned results. \n'
            + '    <profileId>              - Numeric - The ID of the profile linked to the listing item \n'
            + '                                templates we want to search for. \n'
            + '    <categoryName>           - [optional] String - The key identifying the category \n'
            + '                                associated with the listing item templates we want to \n'
            + '                                search for. \n'
            + '    <searchString>           - [optional] String - A string that is used to search for \n'
            + '                                listing item templats via title. ';
    }
    description() {
        return 'Search listing items with pagination by category id or'
            + ' category name or by profileId, or by perticular searchString matched with itemInformation title.';
    }
    example() {
        return 'template ' + this.getName() + ' 1 10 ASC 1 74 \'pet exorcism\'';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateSearchCommand.prototype, "execute", null);
ListingItemTemplateSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService])
], ListingItemTemplateSearchCommand);
exports.ListingItemTemplateSearchCommand = ListingItemTemplateSearchCommand;
//# sourceMappingURL=ListingItemTemplateSearchCommand.js.map