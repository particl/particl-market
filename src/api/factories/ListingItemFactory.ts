import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import * as resources from 'resources';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { LocationMarkerCreateRequest } from '../requests/LocationMarkerCreateRequest';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { EscrowRatioCreateRequest } from '../requests/EscrowRatioCreateRequest';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { ShippingPriceCreateRequest } from '../requests/ShippingPriceCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { MessagingProtocolType } from '../enums/MessagingProtocolType';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import {ItemLocationCreateRequest} from '../requests/ItemLocationCreateRequest';

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
    public async getMessage(listingItemTemplate: resources.ListingItemTemplate): Promise<ListingItemMessage> {

        const information = await this.getMessageInformation(listingItemTemplate.ItemInformation);
        const payment = await this.getMessagePayment(listingItemTemplate.PaymentInformation);
        const messaging = await this.getMessageMessaging(listingItemTemplate.MessagingInformation);
        const objects = await this.getMessageObjects(listingItemTemplate.ListingItemObjects);

        const message = {
            hash: listingItemTemplate.hash,
            information,
            payment,
            messaging,
            objects
        } as ListingItemMessage;

        return message;
    }

    /**
     * Creates a ListingItemCreateRequest from given data
     *
     * @param data
     * @returns {ListingItemCreateRequest}
     */
    public async getModel(listingItemMessage: ListingItemMessage, marketId: number,
                          rootCategory: resources.ItemCategory): Promise<ListingItemCreateRequest> {

        const itemInformation = await this.getModelItemInformation(listingItemMessage.information, rootCategory);
        const paymentInformation = await this.getModelPaymentInformation(listingItemMessage.payment);
        const messagingInformation = await this.getModelMessagingInformation(listingItemMessage.messaging);
        const listingItemObjects = await this.getModelListingItemObjects(listingItemMessage.objects);

        return {
            hash: listingItemMessage.hash,
            market_id: marketId,
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects
        } as ListingItemCreateRequest;
    }

    // ---------------
    // MODEL
    // ---------------
    private async getModelListingItemObjects(objects: any): Promise<ListingItemObjectCreateRequest[]> {
        // TODO: impl
        return [];
    }

    private async getModelMessagingInformation(messaging: any): Promise<MessagingInformationCreateRequest[]> {
        const messagingArray: MessagingInformationCreateRequest[] = [];
        for (const messagingData of messaging) {
            messagingArray.push({
                protocol: MessagingProtocolType[messagingData.protocol],
                publicKey: messagingData.public_key
            } as MessagingInformationCreateRequest);
        }
        return messagingArray;
    }

    private async getModelPaymentInformation(payment: any): Promise<PaymentInformationCreateRequest> {
        const escrow = await this.getModelEscrow(payment.escrow);
        const itemPrice = await this.getModelItemPrice(payment.cryptocurrency);

        return {
            type: payment.type,
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;
    }

    private async getModelItemPrice(cryptocurrency: any): Promise<ItemPriceCreateRequest> {
        const shippingPrice = await this.getModelShippingPrice(cryptocurrency[0].shipping_price);
        const cryptocurrencyAddress = await this.getModelCryptocurrencyAddress(cryptocurrency[0].address);
        return {
            currency: cryptocurrency[0].currency,
            basePrice: cryptocurrency[0].base_price,
            shippingPrice,
            cryptocurrencyAddress
        } as ItemPriceCreateRequest;
    }

    private async getModelShippingPrice(shippingPrice: any): Promise<ShippingPriceCreateRequest> {
        return {
            domestic: shippingPrice.domestic,
            international: shippingPrice.international
        } as ShippingPriceCreateRequest;
    }

    private async getModelCryptocurrencyAddress(cryptocurrencyAddress: any): Promise<CryptocurrencyAddressCreateRequest> {
        return {
            type: cryptocurrencyAddress.type,
            address: cryptocurrencyAddress.address
        } as CryptocurrencyAddressCreateRequest;
    }

    private async getModelEscrow(escrow: any): Promise<EscrowCreateRequest> {
        const ratio = await this.getModelEscrowRatio(escrow.ratio);
        return {
            type: escrow.type,
            ratio
        } as EscrowCreateRequest;
    }

    private async getModelEscrowRatio(ratio: any): Promise<EscrowRatioCreateRequest> {
        return {
            buyer: ratio.buyer,
            seller: ratio.seller
        } as EscrowRatioCreateRequest;
    }

    private async getModelItemInformation(information: any, rootCategory: resources.ItemCategory): Promise<ItemInformationCreateRequest> {
        const itemCategory = await this.itemCategoryFactory.getModel(information.category, rootCategory);
        const itemLocation = await this.getModelLocation(information.location);
        const shippingDestinations = await this.getModelShippingDestinations(information.shipping_destinations);
        const itemImages = await this.getModelImages(information.images);

        return {
            title: information.title,
            shortDescription: information.short_description,
            longDescription: information.long_description,
            itemCategory,
            itemLocation,
            shippingDestinations,
            itemImages
        } as ItemInformationCreateRequest;
    }

    private async getModelLocation(location: any): Promise<ItemLocationCreateRequest> {
        const locationObject: any = {};
        const region = location.country;
        const address = location.address;

        if (region) {
            locationObject.region = region;
        }
        if (address) {
            locationObject.address = address;
        }

        if (location.gps) {
            const locationMarker = await this.getModelLocationMarker(location.gps);
            locationObject.locationMarker = locationMarker;

        }

        return locationObject;
    }

    private async getModelLocationMarker(gps: any): Promise<LocationMarkerCreateRequest> {
        const lat: number = gps.lat;
        const lng: number = gps.lng;
        const locationMarker = {
            lat,
            lng
        } as LocationMarkerCreateRequest;

        if (gps.marker_title) {
            locationMarker.markerTitle = gps.marker_title;
        }
        if (gps.marker_text) {
            locationMarker.markerText = gps.marker_text;
        }
        return locationMarker as LocationMarkerCreateRequest;
    }

    private async getModelShippingDestinations(shippingDestinations: string[]): Promise<resources.ShippingDestination[]> {

        const destinations: resources.ShippingDestination[] = [];
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
            } as resources.ShippingDestination);
        }

        return destinations;
    }

    private async getModelImages(images: any[]): Promise<ItemImageCreateRequest[]> {

        const imageCreateRequests: ItemImageCreateRequest[] = [];
        for (const image of images) {
            const data = await this.getModelImageData(image.data);
            imageCreateRequests.push({
                hash: image.hash,
                data
            } as ItemImageCreateRequest);
        }
        return imageCreateRequests;
    }

    private async getModelImageData(imageDatas: any[]): Promise<ItemImageDataCreateRequest[]> {

        const imageDataCreateRequests: ItemImageDataCreateRequest[] = [];
        for (const imageData of imageDatas) {
            imageDataCreateRequests.push({
                dataId: imageData.id,
                protocol: imageData.protocol,
                imageVersion: ImageVersions.ORIGINAL.propName,
                encoding: imageData.encoding,
                data: imageData.data
            } as ItemImageDataCreateRequest);
        }
        return imageDataCreateRequests;
    }


    // ---------------
    // MESSAGE
    // ---------------
    private async getMessageInformation(itemInformation: resources.ItemInformation): Promise<any> {
        const category = await this.itemCategoryFactory.getArray(itemInformation.ItemCategory);
        const location = await this.getMessageInformationLocation(itemInformation.ItemLocation);
        const shippingDestinations = await this.getMessageInformationShippingDestinations(itemInformation.ShippingDestinations);
        const images = await this.getMessageInformationImages(itemInformation.ItemImages);

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

    private async getMessageInformationLocation(itemLocation: resources.ItemLocation): Promise<any> {
        const locationMarker: resources.LocationMarker = itemLocation.LocationMarker;
        const informationLocation: any = {};
        if (itemLocation.region) {
            informationLocation.country = itemLocation.region;
        }
        if (itemLocation.address) {
            informationLocation.address = itemLocation.address;
        }
        if (locationMarker) {
            informationLocation.gps = {
                lng: locationMarker.lng,
                lat: locationMarker.lat
            };

            if (locationMarker.markerTitle) {
                informationLocation.gps.marker_title = locationMarker.markerTitle;
            }
            if (locationMarker.markerText) {
                informationLocation.gps.marker_text = locationMarker.markerText;
            }
        }
        return informationLocation;
    }

    private async getMessageInformationShippingDestinations(shippingDestinations: resources.ShippingDestination[]): Promise<string[]> {
        const shippingDesArray: string[] = [];
        shippingDestinations.forEach((value) => {
            switch (value.shippingAvailability) {
                case ShippingAvailability.SHIPS:
                    shippingDesArray.push(value.country);
                    break;
                case ShippingAvailability.DOES_NOT_SHIP:
                    shippingDesArray.push('-' + value.country);
                    break;
            }
        });
        return shippingDesArray;
    }

    private async getMessageInformationImages(images: resources.ItemImage[]): Promise<object[]> {
        const imagesArray: object[] = [];

        for (const image of images) {
            const imageData = await this.getMessageInformationImageData(image.ItemImageDatas);
            imagesArray.push({
                hash: image.hash,
                data: imageData
            });
        }
        return imagesArray;
    }

    private async getMessageInformationImageData(itemImageDatas: resources.ItemImageData[]): Promise<object[]> {
        const imageDataArray: object[] = [];
        for (const imageData of itemImageDatas) {
            // we only want the original
            if (imageData.imageVersion === ImageVersions.ORIGINAL.propName) {
                imageDataArray.push({
                    protocol: imageData.protocol,
                    encoding: imageData.encoding,
                    data: imageData.data,
                    id: imageData.dataId
                });
            }
        }
        return imageDataArray;
    }


    private async getMessagePayment(paymentInformation: resources.PaymentInformation): Promise<object> {
        const escrow = await this.getMessageEscrow(paymentInformation.Escrow);
        const cryptocurrency = await this.getMessageCryptoCurrency(paymentInformation.ItemPrice);
        return {
            type: paymentInformation.type,
            escrow,
            cryptocurrency
        };
    }

    private async getMessageEscrow(escrow: resources.Escrow): Promise<object> {
        return {
            type: escrow.type,
            ratio: {
                buyer: escrow.Ratio.buyer,
                seller: escrow.Ratio.seller
            }
        };
    }

    private async getMessageCryptoCurrency(itemPrice: resources.ItemPrice): Promise<object> {
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

    // objects fields
    private async getMessageObjects(listingItemObjects: resources.ListingItemObject[]): Promise<any> {
        const objectArray: object[] = [];
        listingItemObjects.forEach(async (value) => {
            const objectValue = await this.getObjectArray(value);
            objectArray.push(objectValue);
        });
        return objectArray;
    }

    private async getObjectArray(value: resources.ListingItemObject): Promise<any> {
        // check Table and Dropdown
        if (value.type === 'TABLE') {
            return {
                type: 'TABLE',
                title: value.description,
                table: await this.getObjectDataTable(value.ListingItemObjectDatas)
            };
        } else if (value.type === 'DROPDOWN') {
            return {
                type: 'DROPDOWN',
                id: value.objectId,
                title: value.description,
                force_input: value.forceInput,
                options: await this.getObjectDataOptions(value.ListingItemObjectDatas)
            };
        }
    }

    private async getObjectDataTable(objectDatas: resources.ListingItemObjectData[]): Promise<any> {
        const objectDataArray: object[] = [];
        objectDatas.forEach((objectValue) => {
            objectDataArray.push({
                key: objectValue.key,
                value: objectValue.value
            });
        });
        return objectDataArray;
    }

    private async getObjectDataOptions(objectDatas: resources.ListingItemObjectData[]): Promise<any> {
        const objectDataArray: object[] = [];
        objectDatas.forEach( async (objectValue) => {
            objectDataArray.push({
                name: objectValue.key,
                value: objectValue.value
                // todo
                // add_to_price: [
                //     50000000,
                //     300000000
                // ]
            });
        });
        return objectDataArray;
    }

}
