"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemService_1 = require("../../services/ListingItemService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const ListingItemSearchType_1 = require("../../enums/ListingItemSearchType");
const ShippingCountries_1 = require("../../../core/helpers/ShippingCountries");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const MessageException_1 = require("../../exceptions/MessageException");
let ListingItemSearchCommand = class ListingItemSearchCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemService) {
        super(CommandEnumType_1.Commands.ITEM_SEARCH);
        this.Logger = Logger;
        this.listingItemService = listingItemService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to search item basePrice between 2 range
     *  [7]: maxPrice, number to search item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const type = data.params[4] || 'ALL';
            const profileId = data.params[5] || 'ALL';
            // check valid search type
            if (!ListingItemSearchType_1.ListingItemSearchType[type]) {
                throw new MessageException_1.MessageException('Type should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
            }
            // check vaild profile profileId search params
            if (typeof profileId !== 'number' && profileId !== 'OWN' && profileId !== 'ALL' && profileId !== '*') {
                throw new MessageException_1.MessageException('Value needs to be number | OWN | ALL. you could pass * as all too');
            }
            let countryCode = null;
            if (data.params[8]) {
                countryCode = ShippingCountries_1.ShippingCountries.validate(this.log, data.params[8]);
            }
            let shippingCountryCode = null;
            if (data.params[9]) {
                shippingCountryCode = ShippingCountries_1.ShippingCountries.validate(this.log, data.params[9]);
            }
            // TODO: this type search does not really make sense
            // TODO: searching for items that youre buying or selling should be done with bid or orderitem search
            // TODO: ...so remove type
            return yield this.listingItemService.search({
                page: data.params[0] || 1,
                pageLimit: data.params[1] || 5,
                order: data.params[2] || 'ASC',
                category: data.params[3],
                type,
                profileId,
                minPrice: data.params[6],
                maxPrice: data.params[7],
                country: countryCode,
                shippingDestination: shippingCountryCode,
                searchString: data.params[10] || ''
            }, data.params[11]);
        });
    }
    // tslint:disable:max-line-length
    usage() {
        return this.getName() + ' [<page> [<pageLimit> [<order> ' +
            '[(<categoryId> | <categoryName>)[ <type> [(<profileId>| OWN | ALL) [<minPrice> [ <maxPrice> [ <country> [ <shippingDestination> [<searchString>]]]]]]]]]]';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of search listing item results. \n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page. \n'
            + '    <order>                  - [optional] ENUM{ASC} - The order of the returned results. \n'
            + '    <categoryId>             - [optional] Numeric - The ID identifying the category associated \n'
            + '                                with the listing items we want to search for. \n'
            + '    <categoryName>           - [optional] String - The key identifying the category associated \n'
            + '                                with the listing items we want to search for. \n'
            + '    <type>                  -  ENUM{FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL} \n'
            + '                                 FLAGGED = ListingItems you have flagged \n'
            + '                                 PENDING = ListingItemTemplates posted to marketplace\n'
            + '                                           but not yet received as ListingItem \n'
            + '                                 IN_ESCROW = ListingItems that are escrow \n'
            + '                                 SHIPPED = ListingItems that have been shipped \n'
            + '                                 SOLD = ListingItems that have been sold \n'
            + '                                 EXPIRED = ListingItems that have been expired \n'
            + '                                 ALL = all items\n'
            + '    <profileId>             -  (NUMBER | OWN | ALL | *) \n'
            + '                                 NUMBER - ListingItems belonging to profileId \n'
            + '                                 OWN - ListingItems belonging to any profile \n'
            + '                                 ALL / * - ALL ListingItems\n'
            + '    <minPrice>               - [optional] Numeric - The minimum price of the listing item price \n'
            + '                                we want to search for between basePrice range. \n'
            + '    <maxPrice>               - [optional] Numeric - The maximum price of the listing item price \n'
            + '                                we want to search for between basePrice range. \n'
            + '    <country>                - [optional] String - The country of the listing item \n'
            + '                                we want to search for. \n'
            + '    <shippingDestination>    - [optional] String - The shipping destination of the listing item \n'
            + '                                we want to search for. \n'
            + '    <searchString>           - [optional] String - A string that is used to \n'
            + '                                find listing items by their titles. \n'
            + '    <withRelated>            - [optional] Boolean - Whether to include related data or not (default: true). ';
    }
    // tslint:enable:max-line-length
    description() {
        return 'Search listing items with pagination by category id or'
            + ' category name or by profileId, or by listing item price'
            + ' min and max price range, or by country or shipping destination.';
    }
    example() {
        return 'item ' + this.getName() + ' 1 10 ASC 76 1 100 200 Australia China wine';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemSearchCommand.prototype, "execute", null);
ListingItemSearchCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemService_1.ListingItemService])
], ListingItemSearchCommand);
exports.ListingItemSearchCommand = ListingItemSearchCommand;
//# sourceMappingURL=ListingItemSearchCommand.js.map