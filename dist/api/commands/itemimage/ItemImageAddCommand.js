"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemImageService_1 = require("../../services/ItemImageService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
const ImageVersionEnumType_1 = require("../../../core/helpers/ImageVersionEnumType");
let ItemImageAddCommand = class ItemImageAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemImageService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.ITEMIMAGE_ADD);
        this.Logger = Logger;
        this.itemImageService = itemImageService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: dataId
     *  [2]: protocol
     *  [3]: encoding
     *  [4]: data
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // check listingItemTemplate id present in params
            if (!data.params[0]) {
                throw new MessageException_1.MessageException('ListingItemTemplate id can not be null.');
            }
            // find listing item template
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(data.params[0]);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            // create item images
            return yield this.itemImageService.create({
                item_information_id: listingItemTemplate.ItemInformation.id,
                data: [{
                        dataId: data.params[1],
                        protocol: data.params[2],
                        encoding: data.params[3],
                        data: data.params[4],
                        imageVersion: ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName
                    }]
            });
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> [<dataId> [<protocol> [<encoding> [<data>]]]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     we want to associate this item image with. \n'
            + '    <dataId>                      - [optional] String - [TODO] \n'
            + '    <protocol>                    - [optional] Enum{LOCAL, IPFS, HTTPS, ONION, SMSG} - The protocol we want to use to load the image. \n'
            + '    <encoding>                    - [optional] Enum{BASE64} - The format the image is encoded in. \n'
            + '    <data>                        - [optional] String - The image\'s data. ';
    }
    description() {
        return 'Add an item image to a listing item template, identified by its ID.';
    }
    example() {
        return 'image ' + this.getName() + ' 1 someDataId LOCAL BASE64 '
            + 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUU'
            + 'H4gIQCyAa2TIm7wAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAaSURBVAjXY/j//z8'
            + 'DA8P///8Z/v//D+EgAAD4JQv1hrMfIwAAAABJRU5ErkJggg== ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemImageAddCommand.prototype, "execute", null);
ItemImageAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemImageService_1.ItemImageService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ItemImageAddCommand);
exports.ItemImageAddCommand = ItemImageAddCommand;
//# sourceMappingURL=ItemImageAddCommand.js.map