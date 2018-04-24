"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ShippingDestinationListCommand = class ShippingDestinationListCommand extends BaseCommand_1.BaseCommand {
    constructor(listingItemTemplateService, listingItemService, Logger) {
        super(CommandEnumType_1.Commands.SHIPPINGDESTINATION_LIST);
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemService = listingItemService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length !== 2) {
                throw new MessageException_1.MessageException('Expected 2 args, got <' + data.params.length + '>.');
            }
            const idType = data.params[0].toString().toLowerCase();
            if (idType === 'template') {
                const templateId = data.params[1];
                let listingItem = yield this.listingItemTemplateService.findOne(templateId, true);
                listingItem = listingItem.toJSON();
                return listingItem['ItemInformation']['ShippingDestinations'];
            }
            else if (idType === 'item') {
                const itemId = data.params[1];
                let listingItem = yield this.listingItemService.findOne(itemId, true);
                listingItem = listingItem.toJSON();
                return listingItem['ItemInformation']['ShippingDestinations'];
            }
            else {
                throw new MessageException_1.MessageException(`Was expecting either "template" or "item" in arg[0], got <${idType}>.`);
            }
        });
    }
    usage() {
        return this.getName() + ' (template <listingItemTemplateId>|item <listingItemId>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    template <listingItemTemplateId>   - Numeric - ID of the item template object associated with \n'
            + '                                          the shipping destinations we want to list. \n'
            + '    item <listingItemId>               - Numeric - ID of the listing item whose shipping destinations \n'
            + '                                          we want to list. ';
    }
    description() {
        return 'List the shipping destinations associated with a template or item.';
    }
    example() {
        return 'shipping ' + this.getName() + ' template 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationListCommand.prototype, "execute", null);
ShippingDestinationListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemService_1.ListingItemService, Object])
], ShippingDestinationListCommand);
exports.ShippingDestinationListCommand = ShippingDestinationListCommand;
//# sourceMappingURL=ShippingDestinationListCommand.js.map