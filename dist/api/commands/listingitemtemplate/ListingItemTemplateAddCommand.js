"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CryptocurrencyAddressType_1 = require("../../enums/CryptocurrencyAddressType");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
let ListingItemTemplateAddCommand = class ListingItemTemplateAddCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService) {
        super(CommandEnumType_1.Commands.TEMPLATE_ADD);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: short description
     *  [3]: long description
     *  [4]: category id
     *
     *  paymentInformation
     *  [5]: payment type
     *  [6]: currency
     *  [7]: base price
     *  [8]: domestic shipping price
     *  [9]: international shipping price
     *  [10]: payment address (optional)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let body;
            if (data.params[1] && data.params[2] && data.params[3] && data.params[4]) {
                let cryptocurrencyAddress = {};
                if (data.params[10]) {
                    cryptocurrencyAddress = {
                        type: CryptocurrencyAddressType_1.CryptocurrencyAddressType.NORMAL,
                        address: data.params[10]
                    };
                }
                body = {
                    profile_id: data.params[0],
                    itemInformation: {
                        title: data.params[1],
                        shortDescription: data.params[2],
                        longDescription: data.params[3],
                        itemCategory: {
                            id: data.params[4]
                        }
                    },
                    paymentInformation: {
                        type: data.params[5],
                        itemPrice: {
                            currency: data.params[6],
                            basePrice: data.params[7],
                            shippingPrice: {
                                domestic: data.params[8],
                                international: data.params[9]
                            },
                            cryptocurrencyAddress
                        }
                    }
                };
            }
            else {
                body = {
                    profile_id: data.params[0]
                };
            }
            return yield this.listingItemTemplateService.create(body);
        });
    }
    usage() {
        return this.getName() + ' <profileId> <title> <shortDescription> <longDescription> <categoryId>'
            + ' <paymentType> <currency> <basePrice> <domesticShippingPrice> <internationalShippingPrice> [<paymentAddress>] ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                   - Numeric - The ID of the profile to associate this \n'
            + '                                     item listing template with. \n'
            + '    <title>                       - String - The default title to associate with \n'
            + '                                     the listing item template we\'re creating. \n'
            + '    <shortDescription>            - String - A short default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <longDescription>             - String - A longer default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <categoryId>                - Numeric - The identifier id of the default \n'
            + '                                     category we want to use with the item listing \n'
            + '                                     template we\'re creating. \n'
            + '    <paymentType>                 - String - Whether the item listing template is by \n'
            + '                                     default for free items or items for sale. \n'
            + '    <currency>                    - String - The default currency for use with the \n'
            + '                                     item template we\'re creating. \n'
            + '    <basePrice>                   - Numeric - The base price for the item template \n'
            + '                                     we\'re creating. \n'
            + '    <domesticShippingPrice>       - Numeric - The default domestic shipping price to \n'
            + '                                     for the item listing template we\'re creating. \n'
            + '    <internationalShippingPrice>  - Numeric - The default international shipping \n'
            + '                                     price for the item listing template we\'re \n'
            + '                                     creating. \n'
            + '    <paymentAddress>              - [optional]String - The default cryptocurrency address for \n'
            + '                                     recieving funds to associate with the listing \n'
            + '                                     item template we\'re creating. ';
    }
    description() {
        return 'Add a new listing item template associate it with a profile.';
    }
    example() {
        return 'template ' + this.getName() + ' 1'
            + ' \'The Communist Manifesto\''
            + ' \'Fight capitalism by buying this book!\''
            + ' \'Impress all your hippest comrades by attending your next communist revolutionary Starbucks meeting with the original'
            + ' and best book on destroying your economy!\''
            + ' 16 SALE BITCOIN 1848 1922 1945 396tyYFbHxgJcf3kSrSdugp6g4tctUP3ay ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ListingItemTemplateAddCommand.prototype, "execute", null);
ListingItemTemplateAddCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService])
], ListingItemTemplateAddCommand);
exports.ListingItemTemplateAddCommand = ListingItemTemplateAddCommand;
//# sourceMappingURL=ListingItemTemplateAddCommand.js.map