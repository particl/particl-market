import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../../services/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { CryptocurrencyAddressType } from '../../enums/CryptocurrencyAddressType';

export class PaymentInformationUpdateCommand implements RpcCommandInterface<PaymentInformation> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updatepaymentinformation';
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
        });
    }

    public help(): string {
        return 'PaymentInformationUpdateCommand: TODO: Fill in help string.';
    }
}
