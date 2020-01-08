// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { EscrowCreateRequest } from '../../requests/model/EscrowCreateRequest';
import { EscrowRatioCreateRequest } from '../../requests/model/EscrowRatioCreateRequest';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ListingItemTemplateCreateParams } from './ModelCreateParams';
import { ListingItemTemplateCreateRequest } from '../../requests/model/ListingItemTemplateCreateRequest';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';

export class ListingItemTemplateFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ListingItemTemplateCreateRequest
     *
     * @param params
     * @param createHash
     */
    public async get(params: ListingItemTemplateCreateParams): Promise<ListingItemTemplateCreateRequest> {

        const createRequest = {
            profile_id: params.profileId,
            generatedAt: +new Date().getTime(),
            itemInformation: {
                title: params.title,
                shortDescription: params.shortDescription,
                longDescription: params.longDescription,
                itemCategory: {
                    id: params.categoryId
                } as ItemCategoryUpdateRequest
            } as ItemInformationCreateRequest,
            paymentInformation: {
                type: params.saleType,
                itemPrice: {
                    // NOTE: we will generate cryptocurrencyAddress just before posting the message
                    // cryptocurrencyAddress: {
                    //     profile_id: params.profileId,
                    //     type: params.paymentAddressType,
                    //     address: params.paymentAddress
                    // } as CryptocurrencyAddressCreateRequest,
                    currency: params.currency,
                    basePrice: params.basePrice,
                    shippingPrice: {
                        domestic: params.domesticShippingPrice,
                        international: params.internationalShippingPrice
                    } as ShippingPriceCreateRequest
                } as ItemPriceCreateRequest,
                escrow: {
                    type: params.escrowType,
                    secondsToLock: 0,
                    ratio: {
                        buyer: params.buyerRatio,
                        seller: params.sellerRatio
                    } as EscrowRatioCreateRequest
                } as EscrowCreateRequest
            } as PaymentInformationCreateRequest
        } as ListingItemTemplateCreateRequest;

        // optional
        if (params[13]) {
            createRequest.parent_listing_item_template_id = params[13];
        }

        // hash should not be saved until just before the ListingItemTemplate is posted,
        // since ListingItemTemplates with hash should not be modified anymore
        // createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableListingItemTemplateCreateRequestConfig());

        return createRequest;
    }
}
