import { inject, named } from 'inversify';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';

import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { ListingItemFactory } from '../../factories/ListingItemFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { ItemCategoryCreateRequest } from '../../requests/ItemCategoryCreateRequest';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { EventEmitter } from '../../../core/api/events';
import * as resources from 'resources';
import { ListingItemMessageInterface } from '../../messages/ListingItemMessageInterface';
import { ListingItemMessage } from '../../messages/ListingItemMessage';

export class ListingItemMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) public itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        // @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // @validate()
    public async process( /*@message(ListingItemMessage)*/
                          listingItemMessage: ListingItemMessage,
                          marketAddress: string): Promise<resources.ListingItem> {
        /*
        DEPRECATED

        // get market
        const marketModel = await this.marketService.findByAddress(marketAddress);
        const market = marketModel.toJSON();

        // create the new custom categories in case there are some
        const itemCategory: resources.ItemCategory = await this.createCategoriesFromArray(listingItemMessage.information.category);

        // find the categories/get the root category with related
        const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
        const rootCategory = rootCategoryWithRelatedModel.toJSON();

        // create ListingItem
        const listingItemCreateRequest = await this.listingItemFactory.getModel(listingItemMessage, market.id, rootCategory);
        // this.log.debug('process(), listingItemCreateRequest:', JSON.stringify(listingItemCreateRequest, null, 2));

        const listingItem = await this.listingItemService.create(listingItemCreateRequest);

        // emit the latest message event to cli
        // this.eventEmitter.emit('cli', {
        //    message: 'new ListingItem received: ' + JSON.stringify(listingItem)
        // });

        // this.log.debug('new ListingItem received: ' + JSON.stringify(listingItem));
        return listingItem;
        */
        return {} as resources.ListingItem;
    }
}
