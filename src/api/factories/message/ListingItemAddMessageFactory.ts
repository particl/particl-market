// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { MessageException } from '../../exceptions/MessageException';
import { EscrowConfig, EscrowRatio, Item, ItemInfo, ItemObject, Location, LocationMarker,
    MessagingInfo, MessagingOption, PaymentInfo, PaymentInfoEscrow, PaymentOption, SellerInfo,
    ShippingPrice } from 'omp-lib/dist/interfaces/omp';
import { MessagingProtocol, MPAction, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { ItemCategoryFactory } from '../model/ItemCategoryFactory';
import { ContentReference, DSN } from 'omp-lib/dist/interfaces/dsn';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { CryptoAddress } from 'omp-lib/dist/interfaces/crypto';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingMessageConfig } from 'omp-lib/dist/hasher/config/listingitemadd';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ListingItemImageAddMessageFactory } from './ListingItemImageAddMessageFactory';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { CoreRpcService } from '../../services/CoreRpcService';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { HashableListingItemTemplateConfig } from '../hashableconfig/model/HashableListingItemTemplateConfig';


// todo: move
export interface VerifiableMessage {
    // not empty
}

// todo: move
export interface SellerMessage extends VerifiableMessage {
    hash: string;               // item hash being added
    address: string;            // seller address
}

export class ListingItemAddMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.model.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.ListingItemImageAddMessageFactory) private listingItemImageAddMessageFactory: ListingItemImageAddMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     * Creates a ListingItemAddMessage from given parameters
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: ListingItemAddRequest): Promise<MarketplaceMessage> {

        if (!actionRequest.listingItem) {
            throw new MissingParamException('listingItem');
        }

        let signature;
        let pubkey;

        if (_.isEmpty(actionRequest.listingItem['signature'])) {
            // listingItem already has the signature, so this is a listingItemTemplate being posted

            // signing requires hash, which the listingItemTemplate doesn't have yet...
            const hash = ConfigurableHasher.hash(actionRequest.listingItem, new HashableListingItemTemplateConfig());

            // sign it and add the seller pubkey to the MessagingInformation
            signature = await this.signSellerMessage(actionRequest.sendParams.wallet, actionRequest.sellerAddress, hash);
            pubkey = await this.coreRpcService.getAddressInfo(actionRequest.sendParams.wallet, actionRequest.sellerAddress)
                .then(value => {
                    if (value.ismine) {
                        return value.pubkey;
                    } else {
                        throw new MessageException('Seller address is not yours.');
                    }
                });
            // not saving the pubkey as part of the ListingItemTemplate because we can use multiple identities to post those,
            // it will be stored as part of the ListingItem once its received.
            actionRequest.listingItem.MessagingInformation.push({
                protocol: MessagingProtocol.SMSG,
                publicKey: pubkey
            } as resources.MessagingInformation);

        } else {
            signature = (actionRequest.listingItem as resources.ListingItem).signature;
        }

        const information = await this.getMessageItemInfo(actionRequest);
        const payment = await this.getMessagePayment(actionRequest);
        const messaging = await this.getMessageMessaging(actionRequest);
        const objects = await this.getMessageObjects(actionRequest);

        if (_.isEmpty(actionRequest.sellerAddress)) {
            throw new MessageException('Cannot create a ListingItemAddMessage without seller information.');
        }

        const item = {
            information,
            seller: {
                address: actionRequest.sellerAddress,
                signature
            } as SellerInfo,
            payment,
            messaging,
            objects
        } as Item;

        const message = {
            type: MPAction.MPA_LISTING_ADD,
            generated: actionRequest.listingItem.generatedAt, // generated should come from the template as its used in hash generation
            item,
            hash: 'recalculateandvalidate'
        } as ListingItemAddMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableListingMessageConfig());

        // this.log.debug('params.listingItem.hash:', JSON.stringify(actionRequest.listingItem.hash, null, 2));
        // this.log.debug('message.hash:', JSON.stringify(message.hash, null, 2));

        return await this.getMarketplaceMessage(message);
    }

    /**
     * signs message containing sellers address and ListingItem hash, proving the message is sent by the seller and with intended contents
     *
     * @param wallet
     * @param address
     * @param hash
     */
    private async signSellerMessage(wallet: string, address: string, hash: string): Promise<string> {
        if (_.isEmpty(wallet)) {
            this.log.error('signSellerMessage(), missing wallet.');
            throw new MissingParamException('wallet');
        }
        if (_.isEmpty(address)) {
            this.log.error('signSellerMessage(), missing address.');
            throw new MissingParamException('address');
        }
        if (_.isEmpty(hash)) {
            this.log.error('signSellerMessage(), missing hash.');
            throw new MissingParamException('hash');
        }
        const message = {
            address,        // seller address
            hash            // item hash
        } as SellerMessage;

        this.log.debug('signSellerMessage(), message: ', JSON.stringify(message, null, 2));
        this.log.debug('signSellerMessage(), address: ', address);
        this.log.debug('signSellerMessage(), hash: ', hash);

        return await this.coreRpcService.signMessage(wallet, address, message);
    }

    private async getMessageItemInfo(actionRequest: ListingItemAddRequest): Promise<ItemInfo> {
        const itemInformation = actionRequest.listingItem.ItemInformation;

        const category: string[] = this.itemCategoryFactory.getArray(itemInformation.ItemCategory);
        const location: Location = await this.getMessageItemInfoLocation(actionRequest);
        const shippingDestinations: string[] | undefined = await this.getMessageItemInfoShippingDestinations(actionRequest);
        const images: ContentReference[] = await this.getMessageInformationImages(actionRequest);

        return {
            title: itemInformation.title,
            shortDescription: itemInformation.shortDescription,
            longDescription: itemInformation.longDescription,
            category,
            location,
            shippingDestinations,
            images: images.length > 0 ? images : undefined
        } as ItemInfo;
    }

    private async getMessageItemInfoLocation(actionRequest: ListingItemAddRequest): Promise<Location> {
        const itemLocation: resources.ItemLocation = actionRequest.listingItem.ItemInformation.ItemLocation;

        const locationMarker: resources.LocationMarker = itemLocation.LocationMarker;
        const informationLocation = {
            country: itemLocation.country,
            address: itemLocation.address
        } as Location;

        if (!_.isEmpty(locationMarker)) {
            informationLocation.gps = {
                lng: locationMarker.lng,
                lat: locationMarker.lat
            } as LocationMarker;

            if (locationMarker.title) {
                informationLocation.gps.title = locationMarker.title;
            }
            if (locationMarker.description) {
                informationLocation.gps.description = locationMarker.description;
            }
        }
        return informationLocation;
    }

    private async getMessageItemInfoShippingDestinations(actionRequest: ListingItemAddRequest): Promise<string[] | undefined> {
        const shippingDestinations: resources.ShippingDestination[] = actionRequest.listingItem.ItemInformation.ShippingDestinations;

        const shippingDesArray: string[] = [];
        for (const destination of shippingDestinations) {
            switch (destination.shippingAvailability) {
                case ShippingAvailability.SHIPS:
                    shippingDesArray.push(destination.country);
                    break;
                case ShippingAvailability.DOES_NOT_SHIP:
                    shippingDesArray.push('-' + destination.country);
                    break;
                case ShippingAvailability.ASK:
                    //
                    break;
                case ShippingAvailability.UNKNOWN:
                    //
                    break;
                default:
                    //
                    break;
            }
        }

        if (_.isEmpty(shippingDesArray)) {
            return undefined;
        }
        return shippingDesArray;
    }

    /**
     * create message.item.information.images: ContentReference[]
     * we are now sending the images as separate messages, so skip the image data...
     *
     * ContentReference (an image)
     *   - hash: string, the image hash
     *   - data: DSN[], image data sources, currently we support just one per image
     *   - featured: boolean, whether the image is the featured one or not
     *
     * @param actionRequest
     */
    private async getMessageInformationImages(actionRequest: ListingItemAddRequest): Promise<ContentReference[]> {
        const images: resources.Image[] = actionRequest.listingItem.ItemInformation.Images;
        const withData: boolean = actionRequest.imagesWithData;
        const contentReferences: ContentReference[] = [];

        for (const image of images) {
            const imageData: DSN[] = await this.listingItemImageAddMessageFactory.getDSNs(image.ImageDatas, withData);
            contentReferences.push({
                hash: image.hash,
                data: imageData,
                featured: image.featured
            } as ContentReference);
        }
        return contentReferences;
    }

    private async getMessagePayment(actionRequest: ListingItemAddRequest): Promise<PaymentInfo> {
        const paymentInformation: resources.PaymentInformation = actionRequest.listingItem.PaymentInformation;
        const cryptoAddress: CryptoAddress = actionRequest.cryptoAddress;

        if (_.isEmpty(paymentInformation)) {
            throw new MessageException('Missing PaymentInformation.');
        }
        if (_.isEmpty(paymentInformation.Escrow)) {
            throw new MessageException('Missing Escrow.');
        }
        if (_.isEmpty(paymentInformation.ItemPrice)) {
            throw new MessageException('Missing ItemPrice.');
        }

        const escrow: EscrowConfig = await this.getMessageEscrow(paymentInformation.Escrow);
        const options: PaymentOption[] = await this.getMessagePaymentOptions(paymentInformation.ItemPrice, cryptoAddress);

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
            secondsToLock: escrow.secondsToLock,
            releaseType: escrow.releaseType // mp 0.3/omp-lib 0.1.129
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

    private async getMessageMessaging(actionRequest: ListingItemAddRequest): Promise<MessagingInfo | undefined> {
        const messagingInformations: resources.MessagingInformation[] = actionRequest.listingItem.MessagingInformation;

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

    private async getMessageObjects(actionRequest: ListingItemAddRequest): Promise<ItemObject[]> {
        const listingItemObjects: resources.ListingItemObject[] = actionRequest.listingItem.ListingItemObjects;

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
