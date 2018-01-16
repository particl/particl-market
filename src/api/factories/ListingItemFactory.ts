import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemTemplatePostRequest } from '../requests/ListingItemTemplatePostRequest';
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
     * @returns {ListingItemTemplatePostRequest}
     */

    public async getMessage(data: ListingItemTemplatePostRequest, marketId: number): Promise<ListingItemMessage> {
        return {
            hash: data.hash,
            listingItemTemplateId: data.id,
            marketId,
            information: {
                title: data.ItemInformation.title,
                shortDescription: data.ItemInformation.shortDescription,
                longDescription: data.ItemInformation.longDescription,
                itemCategory: {
                    id: data.ItemInformation.itemCategoryId
                },
                itemLocation: data.ItemInformation.itemLocation,
                data: data.ItemInformation.itemImages,
                shippingDestinations: data.ItemInformation.shippingDestinations
            },
            payment: {
                type: PaymentType[data.PaymentInformation.type],
                escrow: {
                    type: data.PaymentInformation.escrow
                },
                itemPrice: data.PaymentInformation.itemPrice
            },
            messaging: data.MessagingInformation
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
