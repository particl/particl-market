"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
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
     * [0]: listingItemTemplateId
     * [1]: countryCode
     * [2]: address, optional
     * [3]: gps marker title, optional
     * [4]: gps marker description, optional
     * [5]: gps marker latitude, optional
     * [6]: gps marker longitude, optional
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingItemTemplateId = data.params[0];
            const countryCode = data.params[1];
            const address = data.params[2];
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            let locationMarker;
            const allGpsMarketDataParamsExist = data.params[3] && data.params[4] && data.params[5] && data.params[6];
            if (allGpsMarketDataParamsExist) {
                locationMarker = {
                    markerTitle: data.params[3],
                    markerText: data.params[4],
                    lat: data.params[5],
                    lng: data.params[6]
                };
            }
            const itemLocation = {
                item_information_id: listingItemTemplate.ItemInformation.id,
                region: countryCode,
                address,
                locationMarker
            };
            return this.itemLocationService.create(itemLocation);
        });
    }
    /**
     * data.params[]:
     * [0]: listingItemTemplateId
     * [1]: region (country/countryCode)
     * [2]: address, optional
     * [3]: gps marker title, optional
     * [4]: gps marker description, optional
     * [5]: gps marker latitude, optional
     * [6]: gps marker longitude, optional
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing params.');
            }
            if (data.params.length > 3 && data.params.length !== 7) {
                throw new MessageException_1.MessageException('Missing gps marker data.');
            }
            if (typeof data.params[0] !== 'number') {
                throw new MessageException_1.MessageException('Invalid listingItemTemplateId.');
            }
            if (typeof data.params[1] !== 'string') {
                throw new MessageException_1.MessageException('Invalid region.');
            }
            else {
                // If countryCode is country, convert to countryCode.
                // If countryCode is country code, validate, and possibly throw error.
                data.params[1] = ShippingCountries_1.ShippingCountries.validate(this.log, data.params[1]);
            }
            if (typeof data.params[2] !== 'string') {
                throw new MessageException_1.MessageException('Invalid address.');
            }
            const allGpsMarketDataParamsExist = data.params[3] && data.params[4] && data.params[5] && data.params[6];
            if (allGpsMarketDataParamsExist) {
                if (typeof data.params[3] !== 'string') {
                    throw new MessageException_1.MessageException('Invalid title.');
                }
                if (typeof data.params[4] !== 'string') {
                    throw new MessageException_1.MessageException('Invalid description.');
                }
                if (typeof data.params[5] !== 'number') {
                    throw new MessageException_1.MessageException('Invalid latitude.');
                }
                if (typeof data.params[6] !== 'number') {
                    throw new MessageException_1.MessageException('Invalid longitude.');
                }
            }
            // ItemLocation cannot be created if there's a ListingItem related to ItemInformations ItemLocation.
            // (the item has allready been posted)
            const listingItemTemplateId = data.params[0];
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            if (_.size(listingItemTemplate.ListingItems) > 0) {
                throw new MessageException_1.MessageException(`ListingItem(s) for the listingItemTemplateId=${listingItemTemplateId} allready exist!`);
            }
            if (!_.isEmpty(listingItemTemplate.ItemInformation.ItemLocation)) {
                throw new MessageException_1.MessageException(`ItemLocation for the listingItemTemplateId=${listingItemTemplateId} already exists!`);
            }
            return data;
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
        return 'Command for adding an ItemLocation to your ListingItemTemplate, identified by listingItemTemplateId.';
    }
    example() {
        return '';
        // 'location ' + this.getName() + ' 1 \'United States\' CryptoAddr? [TODO]';
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