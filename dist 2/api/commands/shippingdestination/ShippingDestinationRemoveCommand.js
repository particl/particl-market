"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ShippingDestinationService_1 = require("../../services/ShippingDestinationService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const MessageException_1 = require("../../exceptions/MessageException");
const _ = require("lodash");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ShippingDestinationRemoveCommand = class ShippingDestinationRemoveCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, shippingDestinationService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.SHIPPINGDESTINATION_REMOVE);
        this.Logger = Logger;
        this.shippingDestinationService = shippingDestinationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shippingDestinationId
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shippingDestinationService.destroy(data.params[2]);
        });
    }
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    validate(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length < 2) {
                throw new MessageException_1.MessageException('Missing params.');
            }
            const listingItemTemplateId = data.params[0];
            let countryCode = data.params[1];
            // If countryCode is country, convert to countryCode.
            // If countryCode is country code, validate, and possibly throw error.
            countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            if (listingItemTemplate.ListingItems && listingItemTemplate.ListingItems.length > 0) {
                this.log.warn(`Can't delete ShippingDestination, because the ListingItemTemplate has allready been posted!`);
                throw new MessageException_1.MessageException(`Can't delete ShippingDestination, because the ListingItemTemplate has allready been posted!`);
            }
            if (!_.isEmpty(listingItemTemplate.ItemInformation.ShippingDestinations)) {
                const shippingDestination = _.find(listingItemTemplate.ItemInformation.ShippingDestinations, destination => {
                    return destination.country === countryCode;
                });
                if (shippingDestination === undefined) {
                    throw new MessageException_1.MessageException('ShippingDestination not found.');
                }
                else {
                    data.params[2] = shippingDestination.id;
                }
            }
            else {
                throw new MessageException_1.MessageException('ShippingDestination not found.');
            }
            return data;
        });
    }
    usage() {
        return this.getName() + ' (<shippingDestinationId>|<listing_item_template_id> (<country>|<countryCode>) <shipping availability>) ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <shippingDestinationId>            - Numeric - ID of the shipping destination object we want \n'
            + '                                          to remove. \n'
            + '    <listingItemTemplateId>            - Numeric - ID of the item template object whose destination we want \n'
            + '                                          to remove. \n'
            + '    <country>                          - String - The country name of the shipping destination we want to remove. \n'
            + '    <countryCode>                      - String - Two letter country code of the destination we want to remove. \n'
            + '    <shippingAvailability>             - Enum{SHIPS,DOES_NOT_SHIP,ASK,UNKNOWN} - The \n'
            + '                                          availability of shipping destination we want to remove. ';
    }
    description() {
        return 'Destroy a shipping destination object specified by the ID of the item information object its linked to,'
            + ' the country associated with it, and the shipping availability associated with it.';
    }
    example() {
        return 'shipping ' + this.getName() + ' 1 Australia SHIPS ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationRemoveCommand.prototype, "execute", null);
ShippingDestinationRemoveCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ShippingDestinationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ShippingDestinationService_1.ShippingDestinationService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ShippingDestinationRemoveCommand);
exports.ShippingDestinationRemoveCommand = ShippingDestinationRemoveCommand;
//# sourceMappingURL=ShippingDestinationRemoveCommand.js.map