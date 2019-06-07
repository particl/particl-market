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
    LocationMarker, MessagingInfo, PaymentInfo,
    PaymentInfoEscrow,
    PaymentOption, ShippingPrice
} from 'omp-lib/dist/interfaces/omp';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { ListingItemCreateParams } from './ModelCreateParams';
import { CryptoAddress, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { MessageException } from '../../exceptions/MessageException';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateCreateRequestConfig } from '../hashableconfig/createrequest/HashableListingItemTemplateCreateRequestConfig';
import { HashMismatchException } from '../../exceptions/HashMismatchException';

export class ListingItemFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ListingItemCreateRequest
     *
     * @param listingItemAddMessage
     * @param smsgMessage
     * @param params
     */
    public async get(params: ListingItemCreateParams,
                     listingItemAddMessage: ListingItemAddMessage,
                     smsgMessage: resources.SmsgMessage): Promise<ListingItemCreateRequest> {


        const itemInformation = await this.getModelItemInformation(listingItemAddMessage.item.information, params.rootCategory);

        // todo: only handles escrows for now
        const paymentInformation = await this.getModelPaymentInformation(listingItemAddMessage.item.payment);
        const messagingInformation = await this.getModelMessagingInformation(listingItemAddMessage.item.messaging);

        let listingItemObjects;
        if (listingItemAddMessage.item.objects) {
            listingItemObjects = await this.getModelListingItemObjects(listingItemAddMessage.item.objects);
        }

        const createRequest = {
            msgid: params.msgid,
            seller: smsgMessage.from,
            market_id: params.marketId,
            expiryTime: smsgMessage.daysretention,
            postedAt: smsgMessage.sent,
            expiredAt: smsgMessage.expiration,
            receivedAt: smsgMessage.received,
            generatedAt: listingItemAddMessage.generated,
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            hash: 'recalculateandvalidate'
        } as ListingItemCreateRequest;

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableListingItemTemplateCreateRequestConfig());

        // the createRequest.hash should have a matching hash with the incoming message
        if (listingItemAddMessage.hash !== createRequest.hash) {
            const exception = new HashMismatchException('ListingItemCreateRequest', listingItemAddMessage.hash, createRequest.hash);
            this.log.error(exception.getMessage());
            throw exception;
        }

        return createRequest;
    }

    private async getModelListingItemObjects(objects: ItemObject[]): Promise<ListingItemObjectCreateRequest[]> {
        const objectArray: ListingItemObjectCreateRequest[] = [];
        for (const object of objects) {
            let objectData;
            if (object.table && 'TABLE' === object.type) {
                objectData = await this.getModelObjectDatas(object.table);
            } else if (object.options && 'DROPDOWN' === object.type) {
                objectData = await this.getModelObjectDatas(object.options);
            }
            objectArray.push({
                type: object.type,
                description: object.description,
                listingItemObjectDatas: objectData
            } as ListingItemObjectCreateRequest);
        }
        return objectArray;
    }

    private async getModelObjectDatas(objectDatas: KVS[]): Promise<ListingItemObjectDataCreateRequest[]> {
        const objectDataArray: ListingItemObjectDataCreateRequest[] = [];
        for (const objectData of objectDatas) {
            objectDataArray.push({
                key: objectData.key,
                value: objectData.value
            } as ListingItemObjectDataCreateRequest);
        }
        return objectDataArray;
    }

    private async getModelMessagingInformation(messaging: MessagingInfo): Promise<MessagingInformationCreateRequest[]> {
        const messagingArray: MessagingInformationCreateRequest[] = [];
        if (!messaging || !_.isArray(messaging.options)) {
            return messagingArray;
        }
        for (const messagingData of messaging.options) {
            messagingArray.push({
                protocol: MessagingProtocol[messagingData.protocol],
                publicKey: messagingData.publicKey
            } as MessagingInformationCreateRequest);
        }
        return messagingArray;
    }

    private async getModelPaymentInformation(payment: PaymentInfo): Promise<PaymentInformationCreateRequest> {
        const escrow = payment.escrow ? await this.getModelEscrow(payment.escrow) : undefined;
        const itemPrice = payment.options ? await this.getModelItemPrice(payment.options) : undefined;

        return {
            type: payment.type,
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;
    }

    private async getModelItemPrice(paymentOptions: PaymentOption[]): Promise<ItemPriceCreateRequest> {
        // todo: this needs to be refactored
        const paymentOption: PaymentOption | undefined = _.find(paymentOptions, (option: PaymentOption) => {
            return option.currency === Cryptocurrency.PART;
        });

        if (!paymentOption) {
            this.log.error('There needs to be a PaymentOption for PART');
            throw new MessageException('There needs to be a PaymentOption for PART');
        }

        const shippingPrice = await this.getModelShippingPrice(paymentOption.shippingPrice);

        const cryptocurrencyAddress = paymentOption.address ? await this.getModelCryptocurrencyAddress(paymentOption.address) : undefined;

        return {
            currency: paymentOption.currency,
            basePrice: paymentOption.basePrice,
            shippingPrice,
            cryptocurrencyAddress
        } as ItemPriceCreateRequest;
    }

    private async getModelShippingPrice(shippingPrice: ShippingPrice): Promise<ShippingPriceCreateRequest> {
        return {
            domestic: shippingPrice.domestic,
            international: shippingPrice.international
        } as ShippingPriceCreateRequest;
    }

    private async getModelCryptocurrencyAddress(cryptocurrencyAddress: CryptoAddress): Promise<CryptocurrencyAddressCreateRequest> {
        return {
            type: cryptocurrencyAddress.type,
            address: cryptocurrencyAddress.address
        } as CryptocurrencyAddressCreateRequest;
    }

    private async getModelEscrow(escrow: EscrowConfig): Promise<EscrowCreateRequest> {
        const ratio = await this.getModelEscrowRatio(escrow.ratio);
        return {
            type: escrow.type,
            ratio,
            secondsToLock: escrow.secondsToLock
        } as EscrowCreateRequest;
    }

    private async getModelEscrowRatio(ratio: EscrowRatio): Promise<EscrowRatioCreateRequest> {
        return {
            buyer: ratio.buyer,
            seller: ratio.seller
        } as EscrowRatioCreateRequest;
    }

    private async getModelItemInformation(information: ItemInfo, rootCategory: resources.ItemCategory): Promise<ItemInformationCreateRequest> {
        const itemCategory = await this.itemCategoryFactory.getModel(information.category, rootCategory);
        let itemLocation: ItemLocationCreateRequest | undefined;
        let shippingDestinations: ShippingDestinationCreateRequest[] | undefined;
        let itemImages: ItemImageCreateRequest[] | undefined;

        if (information.location) {
            itemLocation = await this.getModelLocation(information.location);
        }

        if (information.shippingDestinations) {
            shippingDestinations = await this.getModelShippingDestinations(information.shippingDestinations);
        }

        if (information.images) {
            itemImages = await this.getModelImages(information.images);
        }

        return {
            title: information.title,
            shortDescription: information.shortDescription,
            longDescription: information.longDescription,
            itemCategory,
            itemLocation,
            shippingDestinations,
            itemImages
        } as ItemInformationCreateRequest;
    }

    private async getModelLocation(location: Location): Promise<ItemLocationCreateRequest> {
        let locationMarker: LocationMarkerCreateRequest | undefined;
        if (location.gps) {
            locationMarker = await this.getModelLocationMarker(location.gps);
        }
        const country = location.country ? location.country : undefined;
        const address = location.address ? location.address : undefined;

        return {
            country,
            address,
            locationMarker
        } as ItemLocationCreateRequest;
    }

    private async getModelLocationMarker(gps: LocationMarker): Promise<LocationMarkerCreateRequest> {
        const lat = gps.lat;
        const lng = gps.lng;
        const title = gps.title ? gps.title : undefined;
        const description = gps.description ? gps.description : undefined;

        return {
            lat,
            lng,
            title,
            description
        } as LocationMarkerCreateRequest;
    }

    private async getModelShippingDestinations(shippingDestinations: string[]): Promise<ShippingDestinationCreateRequest[]> {

        const destinations: ShippingDestinationCreateRequest[] = [];
        for (const destination of shippingDestinations) {

            let shippingAvailability = ShippingAvailability.SHIPS;
            let country = destination;

            if (destination.charAt(0) === '-') {
                shippingAvailability = ShippingAvailability.DOES_NOT_SHIP;
                country = destination.substring(1);
            }

            destinations.push({
                country,
                shippingAvailability
            } as ShippingDestinationCreateRequest);
        }

        return destinations;
    }

    private async getModelImages(images: ContentReference[]): Promise<ItemImageCreateRequest[]> {

        const imageCreateRequests: ItemImageCreateRequest[] = [];
        for (const image of images) {
            const data = await this.getModelImageDatas(image.data);
            imageCreateRequests.push({
                hash: image.hash,
                data
                // todo: featured
            } as ItemImageCreateRequest);
        }
        return imageCreateRequests;
    }

    private async getModelImageDatas(imageDatas: DSN[]): Promise<ItemImageDataCreateRequest[]> {

        const imageDataCreateRequests: any[] = [];

        for (const imageData of imageDatas) {
            imageDataCreateRequests.push({
                dataId: imageData.dataId,
                protocol: imageData.protocol,
                imageVersion: ImageVersions.ORIGINAL.propName,
                encoding: imageData.encoding,
                data: imageData.data
            });
        }
        return imageDataCreateRequests;
    }
}
