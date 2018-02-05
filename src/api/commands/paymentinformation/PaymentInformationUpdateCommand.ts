import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../../services/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformationUpdateRequest } from '../../requests/PaymentInformationUpdateRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { CryptocurrencyAddressType } from '../../enums/CryptocurrencyAddressType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class PaymentInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<PaymentInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService
    ) {
        super(Commands.PAYMENTINFORMATION_UPDATE);
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
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.paymentInformationService.updateByListingId({
            listing_item_template_id : data.params[0],
            type: data.params[1],
            // escrow: {
            //     type: data.params[2],
            //     ratio: {
            //         buyer: data.params[3],
            //         seller: data.params[4]
            //     }
            // },
            itemPrice: {
                currency: data.params[2],
                basePrice: data.params[3],
                shippingPrice: {
                    domestic: data.params[4],
                    international: data.params[5]
                },
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: data.params[6]
                }
            }
        } as PaymentInformationUpdateRequest);
    }

    public help(): string {
        return this.getName() + ' <listingItemTemplateId> <paymentType> <currency> <basePrice> <domesticShippingPrice>'
            + ' <internationalShippingPrice> <paymentAddress>\n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template\n'
            + '                                     we want to associate this payment information\n'
            + '                                     with.\n'
            + '    <paymentType>                 - String  - Whether associated items are for free or\n'
            + '                                     for sale.\n'
            + '    <currency>                    - String  - The currency that we want to receive\n'
            + '                                     payment in.\n'
            + '    <basePrice>                   - Numeric - The base price of the item associated\n'
            + '                                     with this object.\n'
            + '    <domesticShippingPrice>       - Numeric - The domestic shipping price of the\n'
            + '                                     item associated with this object.\n'
            + '    <internationalShippingPrice>  - Numeric - The international shipping price of\n'
            + '                                     the item associated with this object.\n'
            + '    <paymentAddress>              - String  - The cryptocurrency address we want to\n'
            + '                                     receive payment in.';
    }

    public description(): string {
        return 'Update the details of payment information associated with listingItemTemplateId.';
    }

}
