"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const Validate_1 = require("../../../core/api/Validate");
const constants_1 = require("../../../constants");
const _ = require("lodash");
const PaymentInformationService_1 = require("../../services/PaymentInformationService");
const RpcRequest_1 = require("../../requests/RpcRequest");
const CryptocurrencyAddressType_1 = require("../../enums/CryptocurrencyAddressType");
const CommandEnumType_1 = require("../CommandEnumType");
const BaseCommand_1 = require("../BaseCommand");
const ListingItemTemplateService_1 = require("../../services/ListingItemTemplateService");
const MessageException_1 = require("../../exceptions/MessageException");
let PaymentInformationUpdateCommand = class PaymentInformationUpdateCommand extends BaseCommand_1.BaseCommand {
    constructor(Logger, listingItemTemplateService, paymentInformationService) {
        super(CommandEnumType_1.Commands.PAYMENTINFORMATION_UPDATE);
        this.Logger = Logger;
        this.listingItemTemplateService = listingItemTemplateService;
        this.paymentInformationService = paymentInformationService;
        this.log = new Logger(__filename);
    }
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: payment type
     *  [2]: currency
     *  [3]: base price
     *  [4]: domestic shipping price
     *  [5]: international shipping price
     *  [6]: payment address
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    execute(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // get the template
            const listingItemTemplateId = data.params[0];
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(listingItemTemplateId);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            // template allready has listingitems so for now, it cannot be modified
            if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
                throw new MessageException_1.MessageException(`PaymentInformation for the ListingItemTemplate was not found!`);
            }
            return this.paymentInformationService.update(listingItemTemplate.PaymentInformation.id, {
                listing_item_template_id: data.params[0],
                type: data.params[1],
                itemPrice: {
                    currency: data.params[2],
                    basePrice: data.params[3],
                    shippingPrice: {
                        domestic: data.params[4],
                        international: data.params[5]
                    },
                    cryptocurrencyAddress: {
                        type: CryptocurrencyAddressType_1.CryptocurrencyAddressType.NORMAL,
                        address: data.params[6]
                    }
                }
            });
        });
    }
    usage() {
        return this.getName() + ' <listingItemTemplateId> <paymentType> <currency> <basePrice> <domesticShippingPrice>'
            + ' <internationalShippingPrice> <paymentAddress> ';
    }
    help() {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     we want to associate this payment information \n'
            + '                                     with. \n'
            + '    <paymentType>                 - String  - Whether associated items are for free or \n'
            + '                                     for sale. \n'
            + '    <currency>                    - String  - The currency that we want to receive \n'
            + '                                     payment in. \n'
            + '    <basePrice>                   - Numeric - The base price of the item associated \n'
            + '                                     with this object. \n'
            + '    <domesticShippingPrice>       - Numeric - The domestic shipping price of the \n'
            + '                                     item associated with this object. \n'
            + '    <internationalShippingPrice>  - Numeric - The international shipping price of \n'
            + '                                     the item associated with this object. \n'
            + '    <paymentAddress>              - String  - The cryptocurrency address we want to \n'
            + '                                     receive payment in. ';
    }
    description() {
        return 'Update the details of payment information associated with listingItemTemplateId.';
    }
    example() {
        return 'payment ' + this.getName() + '  1 FREE PART 123 12 34 PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM ';
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(RpcRequest_1.RpcRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [RpcRequest_1.RpcRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], PaymentInformationUpdateCommand.prototype, "execute", null);
PaymentInformationUpdateCommand = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__metadata("design:paramtypes", [Object, ListingItemTemplateService_1.ListingItemTemplateService,
        PaymentInformationService_1.PaymentInformationService])
], PaymentInformationUpdateCommand);
exports.PaymentInformationUpdateCommand = PaymentInformationUpdateCommand;
//# sourceMappingURL=PaymentInformationUpdateCommand.js.map