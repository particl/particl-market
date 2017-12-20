import { inject, named } from 'inversify';
import * as _ from 'lodash';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { ListingItemService } from '../services/ListingItemService';
import { ListingItem } from '../models/ListingItem';

import { ItemCategoryFactory } from '../factories/ItemCategoryFactory';
import { MessagingInformationFactory } from '../factories/MessagingInformationFactory';
import { ItemPriceFactory } from '../factories/ItemPriceFactory';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { isArray } from 'util';

export class ListingItemMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.MessagingInformationFactory) public mesInfoFactory: MessagingInformationFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemPriceFactory) public itemPriceFactory: ItemPriceFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async process(message: any): Promise<ListingItem> {
        // get Category
        const rootCategoryWithRelated: any = await this.itemCategoryService.findRoot();
        const itemCategory: any = await this.itemCategoryFactory.get(message.information.category, rootCategoryWithRelated);
        let itemCategoryId;
        // create category if need
        if (isArray(itemCategory)) {
            let parentItemCategoryId;
            let newCat;
            for (const item of itemCategory) {
                if (item.parent_item_category_id === '0') {
                    item.parent_item_category_id = parentItemCategoryId;
                }
                newCat = await this.itemCategoryService.create(item);
                parentItemCategoryId = newCat.id;
            }
            itemCategoryId = newCat.id;
        } else {
            itemCategoryId = itemCategory.ItemCategory;
        }
        message.information.itemCategory = itemCategoryId;


        // get itemPrice
        const itemPriceData = {
            currency: message.payment.cryptocurrency.currency,
            basePrice: message.payment.cryptocurrency.base_price
        };
        const itemPrice = await this.itemPriceFactory.get(itemPriceData);
        message.payment.itemPrice = itemPrice;
        // get messagingInformation
        const messagingInformation = await this.mesInfoFactory.get(message.messaging);
        message.messaging = messagingInformation;
        // Convert the ListingItemMessage to ListingItem
        const listingItem = await this.listingItemFactory.get(message);
        // create listing-item
        return await this.listingItemService.create(listingItem);
    }

}
