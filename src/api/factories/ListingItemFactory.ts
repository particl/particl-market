import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { PaymentType } from '../enums/PaymentType';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import * as resources from 'resources';
import { ObjectHash } from '../../core/helpers/ObjectHash';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Creates a ListingItemMessage from given data
     * @param listingItemTemplate
     * @returns {Promise<ListingItemMessage>}
     */
    public async getMessage(
        listingItemTemplate: resources.ListingItemTemplate
    ): Promise<ListingItemMessage> {

        // set hash
        listingItemTemplate.hash = ObjectHash.getHash(listingItemTemplate);

        return {
            hash: undefined, // TODO: implement
            information: undefined, // TODO: implement
            payment: undefined, // TODO: implement
            messaging: undefined, // TODO: implement
            objects: undefined // TODO: implement
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
