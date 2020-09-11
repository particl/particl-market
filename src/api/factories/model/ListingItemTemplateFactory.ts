// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { EscrowCreateRequest } from '../../requests/model/EscrowCreateRequest';
import { EscrowRatioCreateRequest } from '../../requests/model/EscrowRatioCreateRequest';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { ImageDataService } from '../../services/model/ImageDataService';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ListingItemTemplateCreateParams } from '../ModelCreateParams';
import { ListingItemTemplateCreateRequest } from '../../requests/model/ListingItemTemplateCreateRequest';


export class ListingItemTemplateFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ListingItemTemplateCreateRequest
     *
     * @param params
     */
    public async get(params: ListingItemTemplateCreateParams): Promise<ListingItemTemplateCreateRequest> {

        const createRequest = {
            profile_id: params.profileId,
            parent_listing_item_template_id: params.parentListingItemTemplateId,
            generatedAt: +Date.now(),
            itemInformation: {
                title: params.title,
                shortDescription: params.shortDescription,
                longDescription: params.longDescription,
                item_category_id: params.categoryId ? params.categoryId : undefined
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
                    releaseType: params.escrowReleaseType,
                    ratio: {
                        buyer: params.buyerRatio,
                        seller: params.sellerRatio
                    } as EscrowRatioCreateRequest
                } as EscrowCreateRequest
            } as PaymentInformationCreateRequest
        } as ListingItemTemplateCreateRequest;

        return createRequest;
    }
}
