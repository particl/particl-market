// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemCreateRequest } from '../../requests/model/ListingItemCreateRequest';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { LocationMarkerCreateRequest } from '../../requests/model/LocationMarkerCreateRequest';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../../requests/model/ItemImageDataCreateRequest';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { EscrowCreateRequest } from '../../requests/model/EscrowCreateRequest';
import { EscrowRatioCreateRequest } from '../../requests/model/EscrowRatioCreateRequest';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { MessagingInformationCreateRequest } from '../../requests/model/MessagingInformationCreateRequest';
import { ListingItemObjectCreateRequest } from '../../requests/model/ListingItemObjectCreateRequest';
import { ListingItemObjectDataCreateRequest } from '../../requests/model/ListingItemObjectDataCreateRequest';
import { ItemLocationCreateRequest } from '../../requests/model/ItemLocationCreateRequest';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import {
    EscrowConfig,
    EscrowRatio,
    ItemInfo,
    ItemObject,
    Location,
    LocationMarker, MessagingInfo,
    PaymentInfoEscrow,
    PaymentOption, ShippingPrice
} from 'omp-lib/dist/interfaces/omp';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import {ListingItemCreateParams, ListingItemTemplateCreateParams} from './ModelCreateParams';
import {CryptoAddress, CryptoAddressType, Cryptocurrency} from 'omp-lib/dist/interfaces/crypto';
import { MessageException } from '../../exceptions/MessageException';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateCreateRequestConfig } from '../hashableconfig/createrequest/HashableListingItemTemplateCreateRequestConfig';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import {ListingItemTemplateCreateRequest} from '../../requests/model/ListingItemTemplateCreateRequest';
import {ItemCategoryCreateRequest} from '../../requests/model/ItemCategoryCreateRequest';
import {IsEnum, IsNotEmpty} from 'class-validator';
import {ItemCategoryUpdateRequest} from '../../requests/model/ItemCategoryUpdateRequest';

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
