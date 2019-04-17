// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplateCreateRequest } from '../../requests/model/ListingItemTemplateCreateRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';

export class ListingItemTemplateAddCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId
     *
     *  paymentInformation
     *  [5]: paymentType
     *  [6]: currency
     *  [7]: basePrice
     *  [8]: domesticShippingPrice
     *  [9]: internationalShippingPrice
     *  [10]: paymentAddress (optional)
     *  [11]: parent_listing_item_template_id (optional)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {
        // TODO: support for custom categories
        // TODO: support for other than CryptoAddressType.NORMAL
        // TODO: create a factory, and reuse the same functions from ListingItemFactory

        const body = {
            profile_id: data.params[0],
            generatedAt: new Date().getTime(),
            itemInformation: {
                title: data.params[1],
                shortDescription: data.params[2],
                longDescription: data.params[3],
                itemCategory: {
                    id: data.params[4]
                }
            } as ItemInformationCreateRequest,
            paymentInformation: {
                type: data.params[5],
                itemPrice: {
                    currency: data.params[6],
                    basePrice: data.params[7],
                    shippingPrice: {
                        domestic: data.params[8],
                        international: data.params[9]
                    } as ShippingPriceCreateRequest
                } as ItemPriceCreateRequest
            } as PaymentInformationCreateRequest
        } as ListingItemTemplateCreateRequest;

        if (data.params[10]) {
            body.paymentInformation.itemPrice.cryptocurrencyAddress = {
                type: CryptoAddressType.NORMAL,
                address: data.params[10]
            } as CryptocurrencyAddressCreateRequest;
        }

        if (data.params[11]) {
            body.parent_listing_item_template_id = data.params[11];
        }

        return await this.listingItemTemplateService.create(body);
    }

    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId
     *
     *  paymentInformation
     *  [5]: paymentType
     *  [6]: currency
     *  [7]: basePrice
     *  [8]: domesticShippingPrice
     *  [9]: internationalShippingPrice
     *  [10]: paymentAddress (optional)
     *  [11]: parentListingItemTemplateHash (optional) (missing from help!)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('profile_id');
        } else if (data.params.length < 2) {
            throw new MissingParamException('title');
        } else if (data.params.length < 3) {
            throw new MissingParamException('shortDescription');
        } else if (data.params.length < 4) {
            throw new MissingParamException('longDescription');
        } else if (data.params.length < 5) {
            throw new MissingParamException('categoryId');
        } else if (data.params.length < 6) {
            throw new MissingParamException('paymentType');
        } else if (data.params.length < 7) {
            throw new MissingParamException('currency');
        } else if (data.params.length < 8) {
            throw new MissingParamException('basePrice');
        } else if (data.params.length < 9) {
            throw new MissingParamException('domesticShippingPrice');
        } else if (data.params.length < 10) {
            throw new MissingParamException('internationalShippingPrice');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profile_id', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('title', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('shortDescription', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('longDescription', 'string');
        } else if (typeof data.params[4] !== 'number') {
            throw new InvalidParamException('categoryId', 'number');
        } else if (typeof data.params[5] !== 'string') {
            throw new InvalidParamException('paymentType', 'string');
        } else if (typeof data.params[6] !== 'string') {
            throw new InvalidParamException('currency', 'string');
        } else if (typeof data.params[7] !== 'number') {
            throw new InvalidParamException('basePrice', 'number');
        } else if (typeof data.params[8] !== 'number') {
            throw new InvalidParamException('domesticShippingPrice', 'number');
        } else if (typeof data.params[9] !== 'number') {
            throw new InvalidParamException('internationalShippingPrice', 'number');
        }

        // override the needed params
        // TODO: validate that category exists
        // TODO: add support for custom categories
        // TODO: we only support SaleType.SALE for now
        // TODO: add support for multiple SaleTypes
        // TODO: missing support for STEALTH ADDRESS

        data.params[5] = SaleType.SALE;

        if (data.params[11]) { // parentListingItemTemplateHash was given, make sure its valid and exists
            if (typeof data.params[11] !== 'string') {
                throw new InvalidParamException('parentListingItemTemplateHash', 'string');
            }
            const listingItemTemplateModel = await this.listingItemTemplateService.findOneByHash(data.params[11])
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });
            const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();
            data.params[11] = listingItemTemplate.id;
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> <title> <shortDescription> <longDescription> <categoryId>'
            + ' <saleType> <currency> <basePrice> <domesticShippingPrice> <internationalShippingPrice> [<paymentAddress>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                   - Numeric - The ID of the profile to associate this \n'
            + '                                     item listing template with. \n'
            + '    <title>                       - String - The default title to associate with \n'
            + '                                     the listing item template we\'re creating. \n'
            + '    <shortDescription>            - String - A short default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <longDescription>             - String - A longer default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <categoryId>                  - Numeric - The identifier id of the default \n'
            + '                                     category we want to use with the item listing \n'
            + '                                     template we\'re creating. \n'
            + '    <saleType>                    - String - Whether the item listing template is by \n'
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

    public description(): string {
        return 'Add a new ListingItemTemplate.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1'
        + ' \'The Communist Manifesto\''
        + ' \'Fight capitalism by buying this book!\''
        + ' \'Impress all your hippest comrades by attending your next communist revolutionary Starbucks meeting with the original'
        + ' and best book on destroying your economy!\''
        + ' 16 SALE BITCOIN 0.1848 0.1922 0.1945 396tyYFbHxgJcf3kSrSdugp6g4tctUP3ay ';
    }
}
