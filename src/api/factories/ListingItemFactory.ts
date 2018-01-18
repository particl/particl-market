import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { PaymentType } from '../enums/PaymentType';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ItemCategoryFactory } from './ItemCategoryFactory';
import { ItemCategory } from '../models/ItemCategory';
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
    public getModel(data: ListingItemMessage): ListingItemCreateRequest {
        // TODO: is not working, fix
        return {
            hash: data.hash,
            itemInformation: {
                title: data.information.title,
                shortDescription: data.information.shortDescription,
                longDescription: data.information.longDescription,
                itemCategory: {
                    id: data.information.itemCategory
                },
                itemLocation: data.information.itemLocation,
                itemImages: data.information.itemImages,
                shippingDestinations: data.information.shippingDestinations
            },
            paymentInformation: data.payment,
            messagingInformation: data.messaging,
            listingItemObjects: {} // we will change it later
        } as ListingItemCreateRequest;
    }
}
