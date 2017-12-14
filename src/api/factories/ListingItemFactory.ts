import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItem } from '../models/ListingItem';

import { ItemMessageInterface } from '../messages/ItemMessageInterface';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';

import { ItemCategoryFactory } from '../factories/ItemCategoryFactory';
import { MessagingInformationFactory } from '../factories/MessagingInformationFactory';
import { ItemPriceFactory } from '../factories/ItemPriceFactory';

export class ListingItemFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.MessagingInformationFactory) public mesInfoFactory: MessagingInformationFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemPriceFactory) public itemPriceFactory: ItemPriceFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(data: ItemMessageInterface): Promise<ListingItem> {
        // get Category
        const itemCategory = await this.itemCategoryFactory.getCategory(data.information.category);
        // get messagingInformation
        const messagingInformation = await this.mesInfoFactory.get(data.messaging);

        // get itemPrice
        const itemPrice = await this.itemPriceFactory.get(data.payment.cryptocurrency);

        const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        const listingItem = {
            hash,
            itemInformation: {
                title: data.information.title,
                shortDescription: data.information.short_description,
                longDescription: data.information.long_description,
                itemCategory: {
                    id: itemCategory.id
                }
            },
            paymentInformation: {
                type: PaymentType[data.payment.type],
                escrow: {
                    type: EscrowType[data.payment.escrow.type]
                },
                itemPrice
            },
            messagingInformation
        };
        return listingItem as any;
    }

}
