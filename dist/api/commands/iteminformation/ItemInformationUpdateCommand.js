"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemInformationService_1 = require("../../services/ItemInformationService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemInformationUpdateCommand = class ItemInformationUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemInformationService) {
        super(CommandEnumType_1.Commands.ITEMINFORMATION_UPDATE);
        this.Logger = Logger;
        this.itemInformationService = itemInformationService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listing template id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: categoryId
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemInformationService.updateWithCheckListingTemplate({
                listing_item_template_id: data.params[0],
                title: data.params[1],
                shortDescription: data.params[2],
                longDescription: data.params[3],
                itemCategory: {
                    id: data.params[4]
                }
            });
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> <title> <shortDescription> <longDescription> <categoryId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     whose associated item information we want to \n'
            + '                                     update. \n'
            + '    <title>                       - String - The new title of the item information \n'
            + '                                     we\'re updating. \n'
            + '    <shortDescription>            - String - The new short description of the item \n'
            + '                                     information we\'re updating. \n'
            + '    <longDescription>             - String - The new long description of the item \n'
            + '                                     information we\'re updating. \n'
            + '    <categoryId>                  - String - The ID that identifies the new \n'
            + '                                     category we want to assign to the item \n'
            + '                                     information we\'re updating. ';
    }
    description() {
        return 'Update the item details of an item information given by listingItemTemplateId.';
    }
    example() {
        return 'information ' + this.getName() + ' 1 Cigarettes \'Cigarette packet\' \'COUGHING NAILS -- when you\\\'ve just got to have a cigarette.\' 76';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationUpdateCommand.prototype, "execute", null);
ItemInformationUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemInformationService_1.ItemInformationService])
], ItemInformationUpdateCommand);
exports.ItemInformationUpdateCommand = ItemInformationUpdateCommand;
//# sourceMappingURL=ItemInformationUpdateCommand.js.map