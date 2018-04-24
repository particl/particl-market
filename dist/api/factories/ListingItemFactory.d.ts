import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import * as resources from 'resources';
export declare class ListingItemFactory {
    Logger: typeof LoggerType;
    private itemCategoryFactory;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemCategoryFactory: ItemCategoryFactory);
    /**
     * Creates a ListingItemMessage from given data
     *
     * @param {'resources'.ListingItemTemplate} listingItemTemplate
     * @param {'resources'.ItemCategory} listingItemCategory
     * @returns {Promise<ListingItemMessage>}
     */
    getMessage(listingItemTemplate: resources.ListingItemTemplate): Promise<ListingItemMessage>;
    /**
     *
     * @param {ListingItemMessage} listingItemMessage
     * @param {number} marketId
     * @param {string} seller
     * @param {"resources".ItemCategory} rootCategory
     * @returns {Promise<ListingItemCreateRequest>}
     */
    getModel(listingItemMessage: ListingItemMessage, marketId: number, seller: string, rootCategory: resources.ItemCategory): Promise<ListingItemCreateRequest>;
    private getModelListingItemObjects(objects);
    private getModelObjectDataForTypeTable(objectDatas);
    private getModelObjectDataForTypeDropDown(objectDatas);
    private getModelMessagingInformation(messaging);
    private getModelPaymentInformation(payment);
    private getModelItemPrice(cryptocurrency);
    private getModelShippingPrice(shippingPrice);
    private getModelCryptocurrencyAddress(cryptocurrencyAddress);
    private getModelEscrow(escrow);
    private getModelEscrowRatio(ratio);
    private getModelItemInformation(information, rootCategory);
    private getModelLocation(location);
    private getModelLocationMarker(gps);
    private getModelShippingDestinations(shippingDestinations);
    private getModelImages(images);
    private getModelImageData(imageDatas);
    private getMessageInformation(itemInformation);
    private getMessageInformationLocation(itemLocation);
    private getMessageInformationShippingDestinations(shippingDestinations);
    private getMessageInformationImages(images);
    private getMessageInformationImageData(itemImageDatas);
    private getMessagePayment(paymentInformation);
    private getMessageEscrow(escrow);
    private getMessageCryptoCurrency(itemPrice);
    private getMessageMessaging(messagingInformation);
    private getMessageObjects(listingItemObjects);
    private getObjectArray(value);
    private getObjectDataTable(objectDatas);
    private getObjectDataOptions(objectDatas);
}
