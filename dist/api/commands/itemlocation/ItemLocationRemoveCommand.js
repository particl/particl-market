"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemLocationService_1 = require("../../services/ItemLocationService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const _ = require("lodash");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemLocationRemoveCommand = class ItemLocationRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemLocationService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.ITEMLOCATION_REMOVE);
        this.Logger = Logger;
        this.itemLocationService = itemLocationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     *
     * data.params[]:
     * [0]: listingItemTemplateId
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = yield this.getItemInformation(data);
            // ItemLocation cannot be removed if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
            if (itemInformation.listingItemId) {
                throw new MessageException_1.MessageException('ItemLocation cannot be removed because the item has allready been posted!');
            }
            else {
                return this.itemLocationService.destroy(itemInformation.ItemLocation.id);
            }
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template. ';
    }
    description() {
        return 'Remove and destroy an item location associated with  listingItemTemplateId.';
    }
    /*
     * TODO: NOTE: This function may be duplicated between commands.
     */
    getItemInformation(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing listing item template
            const listingItemTemplate = yield this.listingItemTemplateService.findOne(data.params[0]);
            // find the related ItemInformation
            const ItemInformation = listingItemTemplate.related('ItemInformation').toJSON();
            // Through exception if ItemInformation or ItemLocation does not exist
            if (_.size(ItemInformation) === 0 || _.size(ItemInformation.ItemLocation) === 0) {
                this.log.warn(`Item Information or Item Location with the listing template id=${data.params[0]} was not found!`);
                throw new MessageException_1.MessageException(`Item Information or Item Location with the listing template id=${data.params[0]} was not found!`);
            }
            return ItemInformation;
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemLocationRemoveCommand.prototype, "execute", null);
ItemLocationRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemLocationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemLocationService_1.ItemLocationService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ItemLocationRemoveCommand);
exports.ItemLocationRemoveCommand = ItemLocationRemoveCommand;
//# sourceMappingURL=ItemLocationRemoveCommand.js.map