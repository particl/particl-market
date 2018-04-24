"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ShippingDestinationService_1 = require("../../services/ShippingDestinationService");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const NotFoundException_1 = require("../../exceptions/NotFoundException");
const MessageException_1 = require("../../exceptions/MessageException");
const _ = require("lodash");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const ShippingAvailability_1 = require("../../enums/ShippingAvailability");
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
     *  [0]: shippingDestinationId
     * or
     * TODO: this seems unnecessary, in what situation would we need this?
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (data.params.length === 1) {
                const shippingDestinationId = data.params[0];
                /// shipping destinations related to listing items cant be modified
                const shippingDestinationModel = yield this.shippingDestinationService.findOne(shippingDestinationId);
                const shippingDestination = shippingDestinationModel.toJSON();
                if (!!shippingDestination.ItemInformation.ListingItem.id) {
                    this.log.warn(`Can't delete shipping destination, because the item has allready been posted!`);
                    throw new MessageException_1.MessageException(`Can't delete shipping destination, because the item has allready been posted!`);
                }
                else {
                    return this.shippingDestinationService.destroy(shippingDestinationId);
                }
            }
            else if (data.params.length === 3) {
                const listingItemTemplateId = data.params[0];
                let countryCode = data.params[1];
                const shippingAvailStr = data.params[2];
                // If countryCode is country, convert to countryCode.
                // If countryCode is country code, validate, and possibly throw error.
                countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, countryCode);
                // Validate shipping availability.
                const shippingAvail = ShippingAvailability_1.ShippingAvailability[shippingAvailStr];
                if (ShippingAvailability_1.ShippingAvailability[shippingAvail] === undefined) {
                    this.log.warn(`Shipping Availability <${shippingAvailStr}> was not valid!`);
                    throw new MessageException_1.MessageException(`Shipping Availability <${shippingAvailStr}> was not valid!`);
                }
                const searchRes = yield this.searchShippingDestination(listingItemTemplateId, countryCode, shippingAvail);
                const shippingDestination = searchRes[0];
                const itemInformation = searchRes[1];
                if (itemInformation.listingItemId) {
                    this.log.warn(`Can't delete shipping destination, because the item has allready been posted!`);
                    throw new MessageException_1.MessageException(`Can't delete shipping destination, because the item has allready been posted!`);
                }
                if (shippingDestination === null) {
                    this.log.warn(`ShippingDestination <${shippingAvailStr}> was not found!`);
                    throw new NotFoundException_1.NotFoundException(listingItemTemplateId);
                }
                return this.shippingDestinationService.destroy(shippingDestination.toJSON().id);
            }
            else {
                throw new MessageException_1.MessageException('Expecting 1 or 3 args, received <' + data.params.length + '>.');
            }
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
    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     */
    searchShippingDestination(listingItemTemplateId, countryCode, shippingAvail) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find listingTemplate
            const listingTemplate = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            // find itemInformation
            const itemInformation = listingTemplate.related('ItemInformation').toJSON();
            // check if itemInformation exist
            if (_.size(itemInformation) === 0) {
                this.log.warn(`ItemInformation with the listing template id=${listingItemTemplateId} was not found!`);
                throw new MessageException_1.MessageException(`ItemInformation with the listing template id=${listingItemTemplateId} was not found!`);
            }
            // check if ShippingDestination already exist for the given Country ShippingAvailability and itemInformation.
            const shippingDest = yield this.shippingDestinationService.search({
                item_information_id: itemInformation.id,
                country: countryCode,
                shippingAvailability: shippingAvail
            });
            return [shippingDest, itemInformation];
        });
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