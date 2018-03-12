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
import { EventEmitter } from '../../core/api/events';
import * as resources from 'resources';

export class ListingItemMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Factory) @named(Targets.Factory.MessagingInformationFactory) public messagingInformationFactory: MessagingInformationFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()

    public async process( @message(ListingItemMessage) data: ListingItemMessage): Promise<ListingItem> {

        // get the category and create the custom categories in case there are some
        const itemCategory: resources.ItemCategory = await this.getOrCreateCategories(data.information.category);

        // get messagingInformation
        const messagingInformation = await this.messagingInformationFactory.get(data.messaging);

        // get default profile
        const market = await this.marketService.getDefault();
        // create listing-item
        const listingItem = await this.listingItemFactory.getModel(data as ListingItemMessage, market.id);

        // NOTE: It is only for the testing purpose for the test cases later we will remove the getting default market
        const defaultMarket = await this.marketService.getDefault();
        listingItem.market_id = defaultMarket.id;

        this.eventEmitter.emit('cli', {
            message: 'listing item message received ' + JSON.stringify(listingItem)
        });

        return await this.listingItemService.create(listingItem as ListingItemCreateRequest);
    }

    /**
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    private async getOrCreateCategories(categoryArray: string[]): Promise<resources.ItemCategory> {

        const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
        let rootCategoryToSearchFrom = rootCategoryWithRelatedModel.toJSON();

        for (const categoryKeyOrName of categoryArray) { // [cat0, cat1, cat2, cat3, cat4]

            let existingCategory = await this.findCategory(rootCategoryToSearchFrom, categoryKeyOrName);

            if (!existingCategory) {

                // category did not exist, so we need to create it
                const categoryCreateRequest = await this.itemCategoryFactory.getModel(
                    categoryKeyOrName,
                    rootCategoryToSearchFrom.id
                );

                // create and assign it as existingCategoru
                const newCategory = await this.itemCategoryService.create(categoryCreateRequest);
                existingCategory = newCategory.toJSON();

            } else {
                // category exists, fetch it
                const existingCategoryModel = await this.itemCategoryService.findOneByKey(categoryKeyOrName);
                existingCategory = existingCategoryModel.toJSON();
            }
            rootCategoryToSearchFrom = existingCategory;
        }

        // return the last catego
        return rootCategoryToSearchFrom;
    }

    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    private async findCategory(rootCategory: resources.ItemCategory, keyOrName: string): Promise<resources.ItemCategory> {

        if (rootCategory.key === keyOrName) {
            // root case
            return rootCategory;
        } else {
            // search the children for a match
            const childCategories = rootCategory.ChildItemCategories;
            return _.find(childCategories, (childCategory) => {
                return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
            });
        }
    }
}
