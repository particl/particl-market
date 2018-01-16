import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { PaymentType } from '../enums/PaymentType';
import { ListingItemMessage } from '../messages/ListingItemMessage';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Factory which will create an ListingItemMessage
     * @param ListingItemMessage
     * @param marketId
     *
     * @returns {ListingItemMessage}
     */

    public async getMessage(data: ListingItemMessage, marketId: number): Promise<ListingItemMessage> {
        return {
            hash: data.hash,
            listingItemTemplateId: data.listingItemTemplateId,
            marketId,
            information: {
                title: data.information.title,
                shortDescription: data.information.shortDescription,
                longDescription: data.information.longDescription,
                itemCategory: {
                    id: data.information.itemCategoryId
                },
                itemLocation: data.information.itemLocation,
                data: data.information.itemImages,
                shippingDestinations: data.information.shippingDestinations
            },
            payment: {
                type: PaymentType[data.payment.type],
                escrow: {
                    type: data.payment.escrow
                },
                itemPrice: data.payment.itemPrice
            },
            messaging: data.messaging
        } as ListingItemMessage;
    }

    /**
     * Factory will return model based on the message
     *
     * @param data
     * @returns {ListingItemCreateRequest}
     */

    public getModel(data: ListingItemMessage): ListingItemCreateRequest {
        return {
            hash: data.hash,
            market_id: data.marketId,
            listing_item_template_id: data.listingItemTemplateId,
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
