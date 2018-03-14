import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import * as resources from 'resources';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
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
    public async getMessage(listingItemTemplate: resources.ListingItemTemplate, listingItemCategory: resources.ItemCategory): Promise<ListingItemMessage> {

        const information = await this.getMessageInformation(listingItemTemplate.ItemInformation, listingItemCategory);
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
    public async getModel(listingItemMessage: ListingItemMessageInterface, marketId: number,
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

    private async getModelLocation(location: any): Promise<any> {

        const region = location.country;
        const address = location.address;
        const locationMarker = await this.getModelLocationMarker(location.gps);

        return {
            region,
            address,
            locationMarker
        };
    }

    private async getModelLocationMarker(gps: any): Promise<LocationMarkerCreateRequest> {

        const markerTitle = gps.marker_title;
        const markerText = gps.marker_text;
        const lat = gps.lat;
        const lng = gps.lng;

        return {
            markerTitle,
            markerText,
            lat,
            lng
        } as LocationMarkerCreateRequest;
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
    private async getMessageInformation(itemInformation: resources.ItemInformation, listingItemCategory: resources.ItemCategory): Promise<any> {
        const category = await this.itemCategoryFactory.getArray(listingItemCategory);
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

    // TODO: objects fields
    private async getMessageObjects(listingItemObjects: resources.ListingItemObject[]): Promise<any> {
        return [];
    }


}
