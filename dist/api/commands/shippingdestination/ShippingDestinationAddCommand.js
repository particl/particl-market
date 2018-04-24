"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ShippingDestinationService_1 = require("../../services/ShippingDestinationService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const _ = require("lodash");
const MessageException_1 = require("../../exceptions/MessageException");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const ShippingAvailability_1 = require("../../enums/ShippingAvailability");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
// TODO: ^^ import * from resources and then use like resources.Class to distinguish from the Model classes in code
let ShippingDestinationAddCommand = class ShippingDestinationAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, shippingDestinationService, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.SHIPPINGDESTINATION_ADD);
        this.Logger = Logger;
        this.shippingDestinationService = shippingDestinationService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * If countryCode is country, convert to countryCode.
     * If countryCode is country code, validate, and possibly throw error.
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('data.params:', data.params);
            const listingItemTemplateId = data.params[0];
            const countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, data.params[1]);
            const shippingAvail = this.validateShippingAvailability(data.params[2]);
            // make sure ItemInformation exists, fetch the ListingItemTemplate
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            if (_.isEmpty(listingItemTemplate.ItemInformation)) {
                this.log.warn(`ItemInformation for the listing template id=${listingItemTemplateId} was not found!`);
                throw new MessageException_1.MessageException(`ItemInformation for the listing template id=${listingItemTemplateId} was not found!`);
            }
            // check if the shipping destination allready exists
            // todo: this validation could be moved to service level and is propably unnecessary
            const shippingDestinations = listingItemTemplate.ItemInformation.ShippingDestinations;
            const existingShippingDestination = _.find(shippingDestinations, { country: countryCode, shippingAvailability: shippingAvail.toString() });
            // create ShippingDestination if not already exist.
            if (!existingShippingDestination) {
                return yield this.shippingDestinationService.create({
                    item_information_id: listingItemTemplate.ItemInformation.id,
                    country: countryCode,
                    shippingAvailability: shippingAvail
                });
            }
            else {
                throw new MessageException_1.MessageException('Shipping destination allready exists.');
            }
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> (<country>|<countryCode>) <shippingAvailability> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>            - Numeric - ID of the item template object we want \n'
            + '                                          to link this shipping destination to. \n'
            + '    <country>                          - String - The country name. \n'
            + '    <countryCode>                      - String - Two letter country code. \n'
            + '                                          associated with this shipping destination. \n'
            + '    <shippingAvailability>             - Enum{SHIPS,DOES_NOT_SHIP,ASK,UNKNOWN} - The \n'
            + '                                          availability of shipping to the specified area. ';
    }
    description() {
        return 'Create a new shipping destination and associate it with an item information object.';
    }
    example() {
        return 'shipping ' + this.getName() + ' 1 Australia UNKNOWN';
    }
    validateShippingAvailability(shippingAvailStr) {
        const shippingAvail = ShippingAvailability_1.ShippingAvailability[shippingAvailStr];
        if (ShippingAvailability_1.ShippingAvailability[shippingAvail] === undefined) {
            this.log.warn(`Shipping Availability <${shippingAvailStr}> was not valid!`);
            throw new MessageException_1.MessageException(`Shipping Availability <${shippingAvailStr}> was not valid!`);
        }
        return shippingAvail;
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingDestinationAddCommand.prototype, "execute", null);
ShippingDestinationAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ShippingDestinationService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ShippingDestinationService_1.ShippingDestinationService,
        ListingItemTemplateService_1.ListingItemTemplateService])
], ShippingDestinationAddCommand);
exports.ShippingDestinationAddCommand = ShippingDestinationAddCommand;
//# sourceMappingURL=ShippingDestinationAddCommand.js.map