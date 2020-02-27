// Copyright (c) 2017-2020, The Particl Market developers
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
    LocationMarker, MessagingInfo, PaymentInfo,
    PaymentInfoEscrow,
    PaymentOption, ShippingPrice
} from 'omp-lib/dist/interfaces/omp';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import {ItemImageCreateParams, ListingItemCreateParams} from './ModelCreateParams';
import { CryptoAddress, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { MessageException } from '../../exceptions/MessageException';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateCreateRequestConfig } from '../hashableconfig/createrequest/HashableListingItemTemplateCreateRequestConfig';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import {ListingItemImageAddMessage} from '../../messages/action/ListingItemImageAddMessage';
import {HashableItemImageCreateRequestConfig} from '../hashableconfig/createrequest/HashableItemImageCreateRequestConfig';

export class ItemImageFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ListingItemCreateRequest
     *
     * @param params
     */
    public async get(params: ItemImageCreateParams): Promise<ItemImageCreateRequest> {

        const data: ItemImageDataCreateRequest[] = await this.getItemImageDataCreateRequests(params.image.data);

        const createRequest = {
            featured: params.image.featured,
            data,
            hash: params.image.hash     // when receiving ListingItem, we should receive the correct hash
        } as ItemImageCreateRequest;

        return createRequest;
    }

    private async getItemImageDataCreateRequests(dsns: DSN[]): Promise<ItemImageDataCreateRequest[]> {

        const imageDataCreateRequests: ItemImageDataCreateRequest[] = [];

        for (const dsn of dsns) {
            // there is no imageVersion on the DSN, so when we receive the ListingItemAddMessage or
            // the ListingItemImageAddMessage, we're always receiving the ORIGINAL version of the Image

            // when we receive ListingItemAddMessage -> ProtocolDSN.SMSG
            // when we receive ListingItemImageAddMessage -> ProtocolDSN.LOCAL
            imageDataCreateRequests.push({
                protocol: dsn.protocol,
                encoding: dsn.encoding,
                dataId: dsn.dataId,
                imageVersion: ImageVersions.ORIGINAL.propName,
                data: dsn.data

                // imageHash,       // added after image is created?
                // originalMime,    // ?
                // originalName     // ?
            } as ItemImageDataCreateRequest);
        }
        return imageDataCreateRequests;
    }
}
