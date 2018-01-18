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
     * @param listingItemTemplate
     * @returns {Promise<ListingItemMessage>}
     */
    public async getMessage(
        listingItemTemplate: resources.ListingItemTemplate,
        rootCategoryWithRelated: ItemCategory
    ): Promise<ListingItemMessage> {

        listingItemTemplate.hash = ObjectHash.getHash(listingItemTemplate);
        const category = listingItemTemplate.ItemInformation.ItemCategory;
        const itemCategory = this.itemCategoryFactory.getArray(category as resources.ItemCategory, rootCategoryWithRelated as ItemCategory);

        const itemInformation = listingItemTemplate.ItemInformation;
        itemInformation['category'] = itemCategory;
        return {
            hash: listingItemTemplate.hash,
            information: itemInformation,
            payment: listingItemTemplate.PaymentInformation,
            messaging: listingItemTemplate.MessagingInformation,
            objects: listingItemTemplate.ListingItemObjects
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
            listingItemObjects: {} as ListingItemObject// we will change it later
        } as ListingItemCreateRequest;
    }
}
