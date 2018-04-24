"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
let ItemImageListCommand = class ItemImageListCommand extends BaseCommand_1.BaseCommand {
    constructor(listingItemTemplateService, listingItemService, Logger) {
        super(CommandEnumType_1.Commands.ITEMIMAGE_LIST);
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemService = listingItemService;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length !== 2) {
                throw new MessageException_1.MessageException('Invalid number of args. Expected 2, got <' + data.params.length + '>.');
            }
            const idType = data.params[0];
            if (idType === 'template') {
                const listingItemTemplateId = data.params[1];
                const retval = yield this.listingItemTemplateService.findOne(listingItemTemplateId, true);
                return retval.toJSON().ItemInformation.ItemImages;
            }
            else if (idType === 'item') {
                const listingItemId = data.params[1];
                const retval = yield this.listingItemService.findOne(listingItemId, true);
                // this.log.debug('ADSDAS: ' + JSON.stringify(retval, null, 2));
                return retval.toJSON().ItemInformation.ItemImages;
            }
            else {
                throw new MessageException_1.MessageException(`Invalid ID type detected <${idType}>. Expected 'template' or 'item'.`);
            }
        });
    }
    usage() {
        return this.getName() + ' (template <listingItemTemplateId>|item <listingItemId>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template whose images we want to list. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item whose images we want to list. ';
    }
    description() {
        return 'Return all images for listing item.';
    }
    example() {
        return 'image ' + this.getName() + ' 1 1 ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageListCommand.prototype, "execute", null);
ItemImageListCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemService_1.ListingItemService, Object])
], ItemImageListCommand);
exports.ItemImageListCommand = ItemImageListCommand;
//# sourceMappingURL=ItemImageListCommand.js.map