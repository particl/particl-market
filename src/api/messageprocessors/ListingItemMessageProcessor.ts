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
        const itemCategory: ItemCategory = await this.createCategories(data.information.category);
        data.information.itemCategory = itemCategory;

        // get messagingInformation
        const messagingInformation = await this.mesInfoFactory.get(data.messaging);
        data.messaging = messagingInformation;

        // get default profile
        const market = await this.marketService.getDefault();
        // create listing-item
        const listingItem = await this.listingItemFactory.getModel(data as ListingItemMessage, market.id);

        // NOTE: It is only for the testing purpose for the test cases later we will remove the getting default market
        const defaultMarket = await this.marketService.getDefault();
        listingItem.market_id = defaultMarket.id;

        return await this.listingItemService.create(listingItem as ListingItemCreateRequest);
    }

    /**
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    private async createCategories(categoryArray: string[]): Promise<ItemCategory> {
        const rootCategoryWithRelated: any = await this.itemCategoryService.findRoot();
        let parentItemCategoryId = 0;
        let returnCategory;
        for (const category of categoryArray) { // [cat0, cat1, cat2, cat3, cat4]
            const catExist = await this.findCategory(rootCategoryWithRelated, category);
            let categoryExist;
            if (!catExist) {
                // not found
                const categoryCreateReq = await this.itemCategoryFactory.getModel(
                    category,
                    parentItemCategoryId
                );
                // check with parentID and name
                categoryExist = await this.itemCategoryService.isCategoryExists(
                    categoryCreateReq.name,
                    returnCategory // as parentCategory
                );
                if (categoryExist === null) {
                    // create and return Id
                    categoryExist = await this.itemCategoryService.create(categoryCreateReq);
                }
            } else {
                categoryExist = await this.itemCategoryService.findOneByKey(category);
            }
            parentItemCategoryId = categoryExist.id;
            returnCategory = categoryExist;
        }
        return returnCategory as ItemCategory;
    }

    /**
     *
     * @param categories : ItemCategory
     * @param value : string(key/name of category)
     * @returns {Promise<string[]>}
     */
    private async findCategory(categories: ItemCategory, value: string): Promise<any> {
        if (categories['key'] === value) { // check cat_ROOT
            return categories;
        } else {
            const categoriesArray = categories.ChildItemCategories;
            return _.find(categoriesArray, (itemcategory) => {
                return (itemcategory['key'] === value || itemcategory['name'] === value);
            });
        }
    }
}
