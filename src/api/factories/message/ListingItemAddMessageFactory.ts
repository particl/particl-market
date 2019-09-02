// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import {
    EscrowConfig, EscrowRatio,
    Item, ItemInfo, ItemObject,
    Location,
    MessagingInfo, MessagingOption,
    MPA,
    PaymentInfo, PaymentInfoEscrow, PaymentOption,
    ShippingPrice
} from 'omp-lib/dist/interfaces/omp';
import { MPAction, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { ItemCategoryFactory } from '../ItemCategoryFactory';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { CryptoAddress } from 'omp-lib/dist/interfaces/crypto';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingMessageConfig } from 'omp-lib/dist/hasher/config/listingitemadd';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import { ListingItemAddMessageCreateParams } from '../../requests/message/ListingItemAddMessageCreateParams';

export class ListingItemAddMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Creates a ListingItemAddMessage from given parameters
     *
     * @param params
     * @returns {Promise<MPA>}
     */

    public async get(params: ListingItemAddMessageCreateParams): Promise<ListingItemAddMessage> {

        const information = await this.getMessageItemInfo(params.listingItem.ItemInformation);
        // this.log.debug('get(), information: ', JSON.stringify(information, null, 2));
        const payment = await this.getMessagePayment(params.listingItem.PaymentInformation, params.cryptoAddress);
        // this.log.debug('get(), payment: ', JSON.stringify(payment, null, 2));
        const messaging = await this.getMessageMessaging(params.listingItem.MessagingInformation);
        // this.log.debug('get(), messaging: ', JSON.stringify(messaging, null, 2));
        const objects = await this.getMessageObjects(params.listingItem.ListingItemObjects);
        // this.log.debug('get(), objects: ', JSON.stringify(objects, null, 2));

        const item = {
            information,
            payment,
            messaging,
            objects
        } as Item;

        const message = {
            type: MPAction.MPA_LISTING_ADD,
            generated: params.listingItem.generatedAt, // generated needs to come from the template as its used in hash generation, so that we can match them
            item,
            hash: 'recalculateandvalidate'
        } as ListingItemAddMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableListingMessageConfig());

        // the listingItemTemplate.hash should have a matching hash with the outgoing message, if the listingItemTemplate has a hash
        if (params.listingItem.hash && params.listingItem.hash !== message.hash) {
            throw new HashMismatchException('ListingItemAddMessage', params.listingItem.hash, message.hash);
        }
        return message;
    }

    private async getMessageItemInfo(itemInformation: resources.ItemInformation): Promise<ItemInfo> {
        const category = await this.itemCategoryFactory.getArray(itemInformation.ItemCategory);
        const location = await this.getMessageItemInfoLocation(itemInformation.ItemLocation);
        const shippingDestinations = await this.getMessageItemInfoShippingDestinations(itemInformation.ShippingDestinations);
        const images = await this.getMessageInformationImages(itemInformation.ItemImages);

        return {
            title: itemInformation.title,
            shortDescription: itemInformation.shortDescription,
            longDescription: itemInformation.longDescription,
            category,
            location,
            shippingDestinations,
            images
        } as ItemInfo;
    }

    private async getMessageItemInfoLocation(itemLocation: resources.ItemLocation): Promise<Location> {
        const locationMarker: resources.LocationMarker = itemLocation.LocationMarker;
        const informationLocation: any = {};
        if (itemLocation.country) {
            informationLocation.country = itemLocation.country;
        }
        if (itemLocation.address) {
            informationLocation.address = itemLocation.address;
        }
        if (!_.isEmpty(locationMarker)) {
            informationLocation.gps = {
                lng: locationMarker.lng,
                lat: locationMarker.lat
            };

            if (locationMarker.title) {
                informationLocation.gps.title = locationMarker.title;
            }
            if (locationMarker.description) {
                informationLocation.gps.description = locationMarker.description;
            }
        }
        return informationLocation;
    }

    private async getMessageItemInfoShippingDestinations(shippingDestinations: resources.ShippingDestination[]): Promise<string[] | undefined> {
        const shippingDesArray: string[] = [];
        for (const destination of shippingDestinations) {
            switch (destination.shippingAvailability) {
                case ShippingAvailability.SHIPS:
                    shippingDesArray.push(destination.country);
                    break;
                case ShippingAvailability.DOES_NOT_SHIP:
                    shippingDesArray.push('-' + destination.country);
                    break;
            }
        }

        if (_.isEmpty(shippingDesArray)) {
            return undefined;
        }
        return shippingDesArray;
    }

    private async getMessageInformationImages(images: resources.ItemImage[]): Promise<ContentReference[]> {
        const contentReferences: ContentReference[] = [];

        for (const image of images) {
            const imageData = await this.getMessageItemInfoImageData(image.ItemImageDatas);
            contentReferences.push({
                hash: image.hash,
                data: imageData,
                featured: image.featured
            } as ContentReference);
        }
        return contentReferences;
    }

    private async getMessageItemInfoImageData(itemImageDatas: resources.ItemImageData[]): Promise<DSN[]> {
        const dsns: DSN[] = [];

        let selectedImageData = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.RESIZED.propName;
        });

        if (!selectedImageData) {
            // if theres no resized version, then ORIGINAL can be used
            selectedImageData = _.find(itemImageDatas, (imageData) => {
                return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
            });

            if (!selectedImageData) {
                // there's something wrong with the ItemImage if original image doesnt have data
                throw new MessageException('Original image data not found.');
            }
        }

        // load the actual image data
        const data = await this.itemImageDataService.loadImageFile(selectedImageData.imageHash, selectedImageData.imageVersion);
        dsns.push({
            protocol: selectedImageData.protocol,
            encoding: selectedImageData.encoding,
            data,
            dataId: selectedImageData.dataId
        } as DSN);

        return dsns;
    }


    private async getMessagePayment(paymentInformation: resources.PaymentInformation, cryptoAddress: CryptoAddress): Promise<PaymentInfo> {
        const escrow = await this.getMessageEscrow(paymentInformation.Escrow);
        const options = await this.getMessagePaymentOptions(paymentInformation.ItemPrice, cryptoAddress);
        switch (paymentInformation.type) {
            case SaleType.SALE:
                return {
                    type: paymentInformation.type,
                    escrow,
                    // TODO: missing support for optional price pegging
                    options
                } as PaymentInfoEscrow;

            case SaleType.AUCTION:
            case SaleType.FREE:
            case SaleType.RENT:
            case SaleType.WANTED:
            default:
                throw new NotImplementedException();
        }
    }

    private async getMessageEscrow(escrow: resources.Escrow): Promise<EscrowConfig> {
        return {
            type: escrow.type,
            ratio: {
                buyer: escrow.Ratio.buyer,
                seller: escrow.Ratio.seller
            } as EscrowRatio,
            secondsToLock: escrow.secondsToLock
        } as EscrowConfig;
    }

    // todo: missing support for multiple payment currencies, the MP currently has just one ItemPrice
    private async getMessagePaymentOptions(itemPrice: resources.ItemPrice, cryptoAddress: CryptoAddress): Promise<PaymentOption[]> {

        let address: CryptoAddress;

        if (!_.isEmpty(cryptoAddress)) {
            // cryptoAddress can be used to override the one set on the template
            address = cryptoAddress;
        } else {
            if (itemPrice.CryptocurrencyAddress) {
                address = {
                    type: itemPrice.CryptocurrencyAddress.type,
                    address: itemPrice.CryptocurrencyAddress.address
                } as CryptoAddress;
            } else {
                address = {} as CryptoAddress;
            }
        }

        return [{
            currency: itemPrice.currency,
            basePrice: itemPrice.basePrice,
            shippingPrice: {
                domestic: itemPrice.ShippingPrice.domestic,
                international: itemPrice.ShippingPrice.international
            } as ShippingPrice,
            address
        }] as PaymentOption[];
    }

    private async getMessageMessaging(messagingInformations: resources.MessagingInformation[]): Promise<MessagingInfo | undefined> {

        const options: MessagingOption[] = [];
        for (const info of messagingInformations) {
            options.push({
                protocol: info.protocol,
                publicKey: info.publicKey
            } as MessagingOption);
        }

        const messagingInfo: MessagingInfo = {
            options
        };

        // dont return empty array if there are no options
        if (_.isEmpty(options)) {
            return undefined;
        }

        return messagingInfo;
    }

    private async getMessageObjects(listingItemObjects: resources.ListingItemObject[]): Promise<ItemObject[]> {
        const objectArray: ItemObject[] = [];
        for (const lio of listingItemObjects) {
            const objectValue = await this.getItemObject(lio);
            objectArray.push(objectValue);
        }
        return objectArray;
    }

    private async getItemObject(value: resources.ListingItemObject): Promise<ItemObject> {
        switch (value.type) {
            case 'TABLE':
                return {
                    type: 'TABLE',
                    description: value.description,
                    table: await this.getObjectDataOptions(value.ListingItemObjectDatas)
                } as ItemObject;
            case 'DROPDOWN':
                return {
                    type: 'DROPDOWN',
                    description: value.description,
                    objectId: value.objectId,
                    forceInput: value.forceInput,
                    options: await this.getObjectDataOptions(value.ListingItemObjectDatas)
                } as ItemObject;
            case 'CHECKBOX':
                return {
                    type: 'CHECKBOX',
                    description: value.description,
                    objectId: value.objectId,
                    forceInput: value.forceInput,
                    options: await this.getObjectDataOptions(value.ListingItemObjectDatas)
                } as ItemObject;
            default:
                throw new NotImplementedException();
        }
    }

    private async getObjectDataOptions(objectDatas: resources.ListingItemObjectData[]): Promise<KVS[]> {
        const objectDataArray: KVS[] = [];
        for (const objectValue of objectDatas) {
            objectDataArray.push({
                key: objectValue.key,
                value: objectValue.value
            } as KVS);
        }
        return objectDataArray;
    }

}
