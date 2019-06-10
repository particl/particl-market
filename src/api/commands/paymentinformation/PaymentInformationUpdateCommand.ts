// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { PaymentInformationService } from '../../services/model/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformationUpdateRequest } from '../../requests/model/PaymentInformationUpdateRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ItemPriceUpdateRequest } from '../../requests/model/ItemPriceUpdateRequest';
import { ShippingPriceUpdateRequest } from '../../requests/model/ShippingPriceUpdateRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CryptocurrencyAddressUpdateRequest } from '../../requests/model/CryptocurrencyAddressUpdateRequest';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';

export class PaymentInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<PaymentInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.PaymentInformationService) private paymentInformationService: PaymentInformationService
    ) {
        super(Commands.PAYMENTINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: paymentType
     *  [2]: currency
     *  [3]: basePrice
     *  [4]: domesticShippingPrice
     *  [5]: internationalShippingPrice
     *  [6]: paymentAddress, optional
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<PaymentInformation> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        let cryptocurrencyAddress: CryptocurrencyAddressUpdateRequest | undefined;

        if (data.params[6]) {
            cryptocurrencyAddress = {
                // TODO: fix
                type: CryptoAddressType.STEALTH,
                address: data.params[6]
            } as CryptocurrencyAddressUpdateRequest;
        }

        const paymentInformationUpdateRequest = {
            type: data.params[1],
            itemPrice: {
                currency: data.params[2],
                basePrice: data.params[3],
                shippingPrice: {
                    domestic: data.params[4],
                    international: data.params[5]
                } as ShippingPriceUpdateRequest,
                cryptocurrencyAddress
            } as ItemPriceUpdateRequest
        } as PaymentInformationUpdateRequest;

        return this.paymentInformationService.update(listingItemTemplate.PaymentInformation.id, paymentInformationUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: saleType
     *  [2]: currency
     *  [3]: basePrice
     *  [4]: domesticShippingPrice
     *  [5]: internationalShippingPrice
     *  [6]: paymentAddress, optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('saleType');
        } else if (data.params.length < 3) {
            throw new MissingParamException('currency');
        } else if (data.params.length < 4) {
            throw new MissingParamException('basePrice');
        } else if (data.params.length < 5) {
            throw new MissingParamException('domesticShippingPrice');
        } else if (data.params.length < 6) {
            throw new MissingParamException('internationalShippingPrice');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('saleType', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('currency', 'string');
        } else if (typeof data.params[3] !== 'number' || data.params[3] < 0) {
            throw new InvalidParamException('basePrice', 'number');
        } else if (typeof data.params[4] !== 'number' || data.params[4] < 0) {
            throw new InvalidParamException('domesticShippingPrice', 'number');
        } else if (typeof data.params[5] !== 'number' || data.params[5] < 0) {
            throw new InvalidParamException('internationalShippingPrice', 'number');
        } else if (data.params[6] && typeof data.params[6] !== 'string') {
            throw new InvalidParamException('paymentAddress', 'string');
        }

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure PaymentInformation exists
        if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        }

        // override the needed params
        // TODO: forced values for now, remove later
        data.params[1] = SaleType.SALE;
        data.params[2] = Cryptocurrency.PART;

        const validSaleTypeTypes = [SaleType.SALE];
        if (validSaleTypeTypes.indexOf(data.params[1]) === -1) {
            throw new InvalidParamException('saleType');
        }

        const validCryptocurrencyTypes = [Cryptocurrency.PART];
        if (validCryptocurrencyTypes.indexOf(data.params[2]) === -1) {
            throw new InvalidParamException('currency');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <paymentType> <currency> <basePrice> <domesticShippingPrice>'
            + ' <internationalShippingPrice> <paymentAddress> ';
    }

    public help(): string {
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

    public description(): string {
        return 'Update the details of PaymentInformation associated with ListingItemTemplate.';
    }

    public example(): string {
        return 'payment ' + this.getName() + '  1 FREE PART 123 12 34 PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM ';
    }
}
