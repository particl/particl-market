import { inject, named } from 'inversify';
import * as _ from 'lodash';
import { message, validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { ListingItemService } from '../services/ListingItemService';
import { ListingItem } from '../models/ListingItem';
import { ItemCategory } from '../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ItemCategoryFactory } from '../factories/ItemCategoryFactory';
import { MessagingInformationFactory } from '../factories/MessagingInformationFactory';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { MarketService } from '../services/MarketService';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { isArray } from 'util';

export class ListingItemMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.MessagingInformationFactory) public mesInfoFactory: MessagingInformationFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()

    public async process( @message(ListingItemMessage) data: ListingItemMessage): Promise<ListingItem> {
        // get Category
        const itemCategory: ItemCategory = await this.createCategoryIfNotExist(data.information.category);
        data.information.itemCategory = itemCategory;

        // get messagingInformation
        const messagingInformation = await this.mesInfoFactory.get(data.messaging);
        data.messaging = messagingInformation;

        // get default profile
        const market = await this.marketService.getDefault();
        // create listing-item
        const listingItem = await this.listingItemFactory.getModel(data as ListingItemMessage, market.id);

        return await this.listingItemService.create(listingItem as ListingItemCreateRequest);
    }

    private async createCategoryIfNotExist(category: string[]): Promise<ItemCategory> {
        const rootCategoryWithRelated: any = await this.itemCategoryService.findRoot();
        const itemCategoryOutPut: any = await this.itemCategoryFactory.getModel(category, rootCategoryWithRelated);
        const itemCategory = itemCategoryOutPut.createdCategories;
        const lastCreatedIndex = itemCategoryOutPut.lastCheckIndex;
        let itemCategoryData: ItemCategory;
        let parentItemCategoryId;
        if (lastCreatedIndex === category.length) {
            // all category is exist
            itemCategoryData = itemCategory[lastCreatedIndex];
        } else {
            // get and create category
            let newCat;
            parentItemCategoryId = itemCategory[lastCreatedIndex].id;
            for (let i = lastCreatedIndex + 1; i < category.length; i++) {
                newCat = await this.itemCategoryService.create({
                    name: category[i],
                    parent_item_category_id: parentItemCategoryId
                } as ItemCategoryCreateRequest);
                parentItemCategoryId = newCat.id;
            }
            itemCategoryData = newCat;
        }
        return itemCategoryData;
    }

}
