"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ItemLocationService_1 = require("../../services/ItemLocationService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const _ = require("lodash");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ItemLocationAddCommand = class ItemLocationAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, itemLocationService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.ITEMLOCATION_ADD);
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
            try {
                const listingItemTemplateId = data.params[0];
                let countryCode;
                if (data.params[1]) {
                    // If countryCode is country, convert to countryCode.
                    // If countryCode is country code, validate, and possibly throw error.
                    countryCode = data.params[1];
                    countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
                }
                else {
                    throw new MessageException_1.MessageException('Country code can\'t be blank.');
                }
                const itemInformation = yield this.getItemInformation(listingItemTemplateId);
                let address = null;
                let locationMarker = null;
                // NOTE: Following arg error handling may be heavier than we need, but you never know when the impossible might happen.
                if (data.params[2]) {
                    address = data.params[2];
                }
                if (data.params[3] && data.params[4] && data.params[5] && data.params[6]) {
                    if (!address) {
                        // true if address wasn't set and all the GPS fields are set.
                        throw new MessageException_1.MessageException('Address must be set if the GPS fields are set.');
                    }
                    locationMarker = {
                        markerTitle: data.params[3],
                        markerText: data.params[4],
                        lat: data.params[5],
                        lng: data.params[6]
                    };
                }
                else if (data.params[3] || data.params[4] || data.params[5] || data.params[6]) {
                    if (!address) {
                        // True if address was not set and some of params[3] ... params[6] were def and others were not
                        throw new MessageException_1.MessageException('Address must be set if the GPS fields are set, and either all or none of the GPS fields must be set.');
                    }
                    else {
                        // True if some of params[3] ... params[6] were def and others were not
                        throw new MessageException_1.MessageException('Either all or none of the GPS fields must be set.');
                    }
                }
                // ItemLocation cannot be created if there's a ListingItem related to ItemInformations ItemLocation. (the item has allready been posted)
                if (itemInformation.listingItemId) {
                    throw new MessageException_1.MessageException('ItemLocation cannot be updated because the item has allready been posted!');
                }
                else {
                    const itemLocation = {
                        item_information_id: itemInformation.id,
                        region: countryCode
                    };
                    if (address) {
                        itemLocation.address = address;
                        if (locationMarker) {
                            itemLocation.locationMarker = locationMarker;
                        }
                    }
                    return this.itemLocationService.create(itemLocation);
                }
            }
            catch (ex) {
                this.log.error(ex);
                throw ex;
            }
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> <region> [<address> [<gpsMarkerTitle> <gpsMarkerDescription> <gpsMarkerLatitude>'
            + ' <gpsMarkerLongitude>]] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>  - Numeric - The ID of the listing item template we want \n'
            + '                                to associate with this item location. \n'
            + '    <region>                 - String - Region, i.e. country or country code. \n'
            + '    <address>                - String - Address [TODO, what kind of address?]. \n'
            + '    <gpsMarkerTitle>         - String - Gps marker title. \n'
            + '    <gpsMarkerDescription>   - String - Gps marker text. \n'
            + '    <gpsMarkerLatitude>      - Numeric - Marker latitude position. \n'
            + '    <gpsMarkerLongitude>     - Numeric - Marker longitude position. ';
    }
    description() {
        return 'Command for adding an item location to your listingItemTemplate, identified by listingItemTemplateId.';
    }
    example() {
        return '';
        // 'location ' + this.getName() + ' 1 \'United States\' CryptoAddr? [TODO]';
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
            if (_.size(ItemInformation) === 0) {
                this.log.warn(`Item Information with the listing template id=${listingItemTemplateId} was not found!`);
                throw new MessageException_1.MessageException(`Item Information with the listing template id=${listingItemTemplateId} was not found!`);
            }
            if (_.size(ItemInformation.ItemLocation) > 0) {
                this.log.warn(`ItemLocation with the listing template id=${listingItemTemplateId} is already exist`);
                throw new MessageException_1.MessageException(`ItemLocation with the listing template id=${listingItemTemplateId} is already exist`);
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
], ItemLocationAddCommand.prototype, "execute", null);
ItemLocationAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ItemLocationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemLocationService_1.ItemLocationService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ItemLocationAddCommand);
exports.ItemLocationAddCommand = ItemLocationAddCommand;
//# sourceMappingURL=ItemLocationAddCommand.js.map