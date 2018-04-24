"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const ListingItemActionService_1 = require("../../services/ListingItemActionService");
let ListingItemTemplatePostCommand = class ListingItemTemplatePostCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemActionService) {
        super(CommandEnumType_1.Commands.TEMPLATE_POST);
        this.Logger = Logger;
        this.listingItemActionService = listingItemActionService;
        this.log = new Logger(__filename);
    }
    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: wheres the validation?!?
            // TODO: if the template doesn't have all the required data, throw an exception
            const response = yield this.listingItemActionService.post({
                listingItemTemplateId: data.params[0],
                marketId: data.params[1] || undefined
            });
            this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
            return response;
        });
    }
    usage() {
        return this.getName() + ' <listingTemplateId> <marketId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to post. \n'
            + '    <marketId>                    - Numeric - The ID of the markte id. ';
    }
    description() {
        return 'Post listing item by listingTemplateId and marketId.';
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
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemActionService_1.ListingItemActionService])
], ListingItemTemplatePostCommand);
exports.ListingItemTemplatePostCommand = ListingItemTemplatePostCommand;
//# sourceMappingURL=ListingItemTemplatePostCommand.js.map