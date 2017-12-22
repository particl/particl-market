import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';

export class ListingItemTemplateCreateCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'createlistingitemtemplate';
    }

    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: short description
     *  [3]: long description
     *  [4]: category
     *
     *  paymentInformation
     *  [5]: payment type
     *  [6]: currency
     *  [7]: base price
     *  [8]: domestic shipping price
     *  [9]: international shipping price
     *  [10]: payment address
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItemTemplate> {
        if (data.params[1] && data.params[2] && data.params[3] && data.params[4]) {
            return this.listingItemTemplateService.create({
                profile_id: data.params[0],
                itemInformation: {
                    title: data.params[1],
                    shortDescription: data.params[2],
                    longDescription: data.params[3],
                    itemCategory: {
                        key: data.params[4]
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
                        cryptocurrencyAddress: {
                            type: 'address-type',
                            address: data.params[10]
                        }
                    }
                },
                messagingInformation: {}
            });
        } else {
            return this.listingItemTemplateService.create({
                profile_id: data.params[0]
            });
        }
    }

    public help(): string {
        return 'ListingItemTemplateCreateCommand: TODO: Fill in help string.';
    }
}
