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
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemLocationUpdateCommand = class ItemLocationUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemLocationService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.ITEMLOCATION_UPDATE);
        this.Logger = Logger;
        this.itemLocationService = itemLocationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     * [0]: listing_item_template_id
     * [1]: region (country/countryCode)
     * [2]: address
     * [3]: gps marker title
     * [4]: gps marker description
     * [5]: gps marker latitude
     * [6]: gps marker longitude
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplateId = data.params[0];
            // If countryCode is country, convert to countryCode.
            // If countryCode is country code, validate, and possibly throw error.
            if (data.params[1]) {
                let countryCode = data.params[1];
                countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
                const itemInformation = yield this.getItemInformation(listingItemTemplateId);
                // ItemLocation cannot be updated if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
                if (itemInformation.listingItemId) {
                    throw new MessageException_1.MessageException('ItemLocation cannot be updated because the item has allready been posted!');
                }
                else {
                    // set body to update
                    const body = {
                        item_information_id: itemInformation.id,
                        region: countryCode,
                        address: data.params[2],
                        locationMarker: {
                            markerTitle: data.params[3],
                            markerText: data.params[4],
                            lat: data.params[5],
                            lng: data.params[6]
                        }
                    };
                    // update item location
                    return this.itemLocationService.update(itemInformation.ItemLocation.id, body);
                }
            }
            else {
                throw new MessageException_1.MessageException('Country code can\'t be blank.');
            }
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> <region> <address> <gpsMarkerTitle>'
            + ' <gpsMarkerDescription> <gpsMarkerLatitude> <gpsMarkerLongitude> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want. \n'
            + '    <region>                 - String - Region, i.e. country or country code. \n'
            + '    <address>                - String - Address. \n'
            + '    <gpsMarkerTitle>         - String - Gps marker title. \n'
            + '    <gpsMarkerDescription>   - String - Gps marker text. \n'
            + '    <gpsMarkerLatitude>      - Numeric - Marker latitude position. \n'
            + '    <gpsMarkerLongitude>     - Numeric - Marker longitude position. ';
    }
    description() {
        return 'Update the details of an item location given by listingItemTemplateId.';
    }
    /*
     * TODO: NOTE: This function may be duplicated between commands.
     */
    getItemInformation(listingItemTemplateId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing listing item template
            const listingItemTemplate = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            // find the related ItemInformation
            const ItemInformation = listingItemTemplate.related('ItemInformation').toJSON();
            // Through exception if ItemInformation or ItemLocation does not exist
            if (_.size(ItemInformation) === 0 || _.size(ItemInformation.ItemLocation) === 0) {
                this.log.warn(`Item Information or Item Location with the listing template id=${listingItemTemplateId} was not found!`);
                throw new MessageException_1.MessageException(`Item Information or Item Location with the listing template id=${listingItemTemplateId} was not found!`);
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
], ItemLocationUpdateCommand.prototype, "execute", null);
ItemLocationUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemLocationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemLocationService_1.ItemLocationService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ItemLocationUpdateCommand);
exports.ItemLocationUpdateCommand = ItemLocationUpdateCommand;
//# sourceMappingURL=ItemLocationUpdateCommand.js.map