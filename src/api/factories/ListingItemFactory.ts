import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ItemMessageInterface } from '../messages/ItemMessageInterface';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(data: ItemMessageInterface, marketId: number): Promise<ListingItemCreateRequest> {
        // const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        const listingItem = {
            hash: crypto.SHA256(new Date().getTime().toString()).toString(),
            market_id: marketId,
            itemInformation: {
                title: data.information.title,
                shortDescription: data.information.short_description,
                longDescription: data.information.long_description,
                itemCategory: {
                    id: data.information.itemCategory
                }
            },
            paymentInformation: {
                type: PaymentType[data.payment.type],
                escrow: {
                    type: EscrowType[data.payment.escrow.type]
                },
                itemPrice: data.payment.itemPrice
            },
            messagingInformation: data.messaging
        };
        return listingItem as any;
    }

}
