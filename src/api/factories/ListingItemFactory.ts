import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';
import * as _ from 'lodash';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(data: ItemMessageInterface): Promise<ListingItemCreateRequest> {
        const escrowType = data.payment.escrow ? EscrowType[data.payment.escrow.type] : EscrowType.MAD;

        const listingItem = {
            hash: data.hash,
            market_id: data.marketId,
            listing_item_template_id: data.listingItemTemplateId,
            itemInformation: {
                title: data.information.title,
                shortDescription: data.information.shortDescription,
                longDescription: data.information.longDescription,
                itemCategory: {
                    id: data.information.itemCategoryId
                },
                itemLocation: data.information.itemLocation,
                itemImages: this.renameItemImageDataToData(data.information.itemImages),
                shippingDestinations: data.information.shippingDestinations
            },
            paymentInformation: {
                type: PaymentType[data.payment.type],
                escrow: {
                    type: escrowType
                },
                itemPrice: data.payment.itemPrice
            },
            messagingInformation: data.messaging
        };
        return listingItem as ListingItemCreateRequest;
    }

    private renameItemImageDataToData(itemImages: string[]): any {
        // convert the itemImageData proverty to data in information.itemImages
        const itemInfo = _.map(itemImages, (itemImage) => {
            if (itemImage['itemImageData']) {
                itemImage['data'] = itemImage['itemImageData'];
                delete itemImage['itemImageData'];
            }
            return itemImage;
        });
        return itemInfo;
    }
}
