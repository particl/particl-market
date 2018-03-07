import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { PaymentType } from '../enums/PaymentType';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ItemCategory } from '../models/ItemCategory';
import { ItemLocation } from '../models/ItemLocation';
import { ItemImage } from '../models/ItemImage';
import { ShippingDestination } from '../models/ShippingDestination';
import { PaymentInformation } from '../models/PaymentInformation';
import { MessagingInformation } from '../models/MessagingInformation';
import { ListingItemObject } from '../models/ListingItemObject';
import * as resources from 'resources';
import { ObjectHash } from '../../core/helpers/ObjectHash';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Creates a ListingItemMessage from given data
     *
     * @param {'resources'.ListingItemTemplate} listingItemTemplate
     * @param {'resources'.ItemCategory} listingItemCategory
     * @returns {Promise<ListingItemMessage>}
     */
    public async getMessage(
        listingItemTemplate: resources.ListingItemTemplate,
        listingItemCategory: resources.ItemCategory
    ): Promise<ListingItemMessage> {

        // create the hash (propably should have been created allready)
        const hash = ObjectHash.getHash(listingItemTemplate);

        const information = await this.getMessageInformation(listingItemTemplate.ItemInformation, listingItemCategory);
        const payment = await this.getMessagePayment(listingItemTemplate.PaymentInformation);
        const messaging = await this.getMessageMessaging(listingItemTemplate.MessagingInformation);
        const objects = await this.getMessageObjects(listingItemTemplate.ListingItemObjects);

        return {
            hash,
            information,
            payment,
            messaging,
            objects
        } as ListingItemMessage;
    }

    /**
     * Factory will return model based on the message
     *
     * @param data
     * @returns {ListingItemCreateRequest}
     */
    public getModel(data: ListingItemMessage, marketId: number): ListingItemCreateRequest {
        // TODO: is not working, fix
        return {
            hash: data.hash,
            market_id: marketId,
            itemInformation: {
                title: data.information.title,
                shortDescription: data.information.shortDescription,
                longDescription: data.information.longDescription,
                itemCategory: data.information.itemCategory as ItemCategory,
                itemLocation: data.information.itemLocation as ItemLocation,
                itemImages: data.information.itemImages as ItemImage,
                shippingDestinations: data.information.shippingDestinations as ShippingDestination
            },
            paymentInformation: data.payment as PaymentInformation,
            messagingInformation: data.messaging as MessagingInformation,
            listingItemObjects: data.objects as ListingItemObject
        } as ListingItemCreateRequest;
    }

    private async getMessageInformation(
        itemInformation: resources.ItemInformation,
        listingItemCategory: resources.ItemCategory
    ): Promise<any> {

        const category = await this.itemCategoryFactory.getArray(listingItemCategory);
        const location = await this.getMessageInformationLocation(itemInformation.ItemLocation);
        const shippingDestinations = await this.getMessageInformationShippingDestination(itemInformation.ShippingDestinations);
        const images = await this.getMessageInformationImage(itemInformation.ItemImages);

        return {
            title: itemInformation.title,
            short_description: itemInformation.shortDescription,
            long_description: itemInformation.longDescription,
            category,
            location,
            shipping_destinations: shippingDestinations,
            images
        };
    }

    private async getMessageInformationLocation(
        itemLocation: resources.ItemLocation
    ): Promise<any> {
        const locationMarker: resources.LocationMarker = itemLocation.LocationMarker;
        return {
            country: itemLocation.region,
            address: itemLocation.address,
            gps: {
                marker_title: locationMarker.markerTitle,
                marker_text: locationMarker.markerText,
                lng: locationMarker.lng,
                lat: locationMarker.lat
            }
        };
    }

    private async getMessageInformationShippingDestination(
        shippingDestinations: resources.ShippingDestination[]
    ): Promise<string[]> {
        const shippingDesArray: string[] = [];
        shippingDestinations.forEach((value) => {
            shippingDesArray.push(value.country);
        });
        return shippingDesArray;
    }

    private async getMessageInformationImage(
        images: resources.ItemImage[]
    ): Promise<object[]> {
        const imagesArray: object[] = [];
        const that = this;
        images.forEach(async (value) => {
            // for image data
            const imageData = await that.getMessageInformationImageData(value.ItemImageDatas);
            const image = {
                hash: value.hash,
                data: imageData
            };
            imagesArray.push(image);
        });
        return imagesArray;
    }

    private async getMessageInformationImageData(
        itemImageDatas: resources.ItemImageData[]
    ): Promise<object[]> {
        const imageDataArray: object[] = [];
        itemImageDatas.forEach((value) => {
            imageDataArray.push({
                protocol: value.protocol,
                encoding: value.encoding,
                data: value.data
            });
        });
        return imageDataArray;
    }


    private async getMessagePayment(
        paymentInformation: resources.PaymentInformation
    ): Promise<any> {
        const escrow = await this.getMessageEscrow(paymentInformation.Escrow);
        const cryptocurrency = await this.getMessageCryptoCurrency(paymentInformation.ItemPrice);
        return {
            type: paymentInformation.type,
            escrow,
            cryptocurrency
        };
    }

    private async getMessageEscrow(
        escrow: resources.Escrow
    ): Promise<any> {
        return {
            type: escrow.type,
            ratio: {
                buyer: escrow.Ratio.buyer,
                seller: escrow.Ratio.seller
            }
        };
    }

    private async getMessageCryptoCurrency(
        itemPrice: resources.ItemPrice
    ): Promise<any> {
        return [
            {
                currency: itemPrice.currency,
                base_price: itemPrice.basePrice,
                shipping_price: {
                    domestic: itemPrice.ShippingPrice.domestic,
                    international: itemPrice.ShippingPrice.international
                },
                address: {
                    type: itemPrice.CryptocurrencyAddress.type,
                    address: itemPrice.CryptocurrencyAddress.address
                }
            }
        ];
    }

    private async getMessageMessaging(messagingInformation: resources.MessagingInformation[]): Promise<object[]> {
        const messageArray: object[] = [];
        messagingInformation.forEach((value) => {
            messageArray.push({
                protocol: value.protocol,
                public_key: value.publicKey
            });
        });
        return messageArray;
    }

    // TODO: objects fields
    private async getMessageObjects(listingItemObjects: resources.ListingItemObject[]): Promise<any> {
        return [];
    }


}
