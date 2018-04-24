"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemActionService_1 = require("../../services/ListingItemActionService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ListingItemUpdateCommand = class ListingItemUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemActionService) {
        super(CommandEnumType_1.Commands.ITEM_POST_UPDATE);
        this.Logger = Logger;
        this.listingItemActionService = listingItemActionService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listingitem hash to update
     *  [1]: listingitemtemplate id to update the listingitem with
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.listingItemActionService.updatePostItem({
                hash: data.params[0],
                listingItemTemplateId: data.params[1] || undefined
            });
        });
    }
    usage() {
        return this.getName() + ' <listingitemHash> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <hash>                   - String - The hash of the listing item we want to Update. \n'
            + '    <listingItemTemplateId>  - Number - The Id of the listing item template which listing-item we want to Update. ';
    }
    description() {
        return 'Update the details of listing item given by listingitemHash or by listingItemTemplateId.';
    }
    example() {
        return 'item ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemUpdateCommand.prototype, "execute", null);
ListingItemUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemActionService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemActionService_1.ListingItemActionService])
], ListingItemUpdateCommand);
exports.ListingItemUpdateCommand = ListingItemUpdateCommand;
//# sourceMappingURL=ListingItemUpdateCommand.js.map