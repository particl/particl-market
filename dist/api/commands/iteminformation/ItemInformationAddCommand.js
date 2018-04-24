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
let ItemInformationAddCommand = class ItemInformationAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemInformationService) {
        super(CommandEnumType_1.Commands.ITEMINFORMATION_ADD);
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
            return this.itemInformationService.create({
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
        return this.getName() + ' <listingTemplateId> <title> <shortDescription> <longDescription> <categoryId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template we \n'
            + '                                     want to associate the created item information with. \n'
            + '    <title>                       - String - The title of the created item \n'
            + '                                     information. \n'
            + '    <shortDescription>            - String - A short description of the created \n'
            + '                                     item information. \n'
            + '    <longDescription>             - String - A long description of the created \n'
            + '                                     item information. \n'
            + '    <categoryId>                  - String - The id that identifies the item \n'
            + '                                     category we want to associate the created \n'
            + '                                     item information with. ';
    }
    description() {
        return 'Create an iteminformation and associate it with a listingTemplateId.';
    }
    example() {
        return 'information ' + this.getName() + ' 1 \'Midori Tabako packet\''
            + ' \'Cigarette packet\' \'You can\\\'t understand the runes, but the packet smells funny.\' 76';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemInformationAddCommand.prototype, "execute", null);
ItemInformationAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemInformationService_1.ItemInformationService])
], ItemInformationAddCommand);
exports.ItemInformationAddCommand = ItemInformationAddCommand;
//# sourceMappingURL=ItemInformationAddCommand.js.map