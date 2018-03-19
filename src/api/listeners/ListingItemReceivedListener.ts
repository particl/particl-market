import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { DefaultItemCategoryService } from '../services/DefaultItemCategoryService';
import { DefaultProfileService } from '../services/DefaultProfileService';
import { DefaultMarketService } from '../services/DefaultMarketService';
import { EventEmitter, events } from '../../core/api/events';
import { MessageProcessor } from '../messageprocessors/MessageProcessor';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import * as resources from 'resources';
import { MarketplaceMessageInterface } from '../messages/MarketplaceMessageInterface';
import { MessageException } from '../exceptions/MessageException';
import { MarketService } from '../services/MarketService';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ItemCategoryFactory } from '../factories/ItemCategoryFactory';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { ListingItemService } from '../services/ListingItemService';

export class ListingItemReceivedListener implements interfaces.Listener {

    public static Event = Symbol('ListingItemReceivedListenerEvent');

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param payload
     * @returns {Promise<void>}
     */
    public async act(message: MarketplaceMessageInterface): Promise<resources.ListingItem> {
        this.log.info('Receive event ListingItemReceivedListener:', message);

        if (message.market && message.item) {
            // get market
            const marketModel = await this.marketService.findByAddress(message.market);
            const market = marketModel.toJSON();

            const listingItemMessage = message.item;
            // create the new custom categories in case there are some
            const itemCategory: resources.ItemCategory = await this.getOrCreateCategories(listingItemMessage.information.category);

            // find the categories/get the root category with related
            const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
            const rootCategory = rootCategoryWithRelatedModel.toJSON();

            // create ListingItem
            const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, rootCategory);
            // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

            // const listingItemModel = await this.listingItemService.create(listingItemCreateRequest);
            // const listingItem = listingItemModel.toJSON();
            // emit the latest message event to cli
            // this.eventEmitter.emit('cli', {
            //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
            // });

            // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
            return {} as resources.ListingItem; // listingItem;

        } else {
            throw new MessageException('Marketplace message missing market.');
        }
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
                const categoryCreateRequest = {
                    name: categoryKeyOrName,
                    parent_item_category_id: rootCategoryToSearchFrom.id
                } as ItemCategoryCreateRequest;

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
