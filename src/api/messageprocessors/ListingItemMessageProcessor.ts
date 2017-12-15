import { inject, named } from 'inversify';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItemFactory } from '../factories/ListingItemFactory';
import { ListingItemService } from '../services/ListingItemService';
import { ListingItem } from '../models/ListingItem';

export class ListingItemMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;
    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // @validate()
    public async process(message: any): Promise<ListingItem> {
        // Convert the ListingItemMessage to ListingItem
        // message = { information: { title: 'Title of the item', short_description: 'A short description / summary of item',
        // long_description: 'A longer description of the item or service',
        // category: ['cat_high_business_corporate', 'Subcategory', 'Subsubcategory'] }, payment: { type: 'SALE', escrow: { type: 'NOP' },
        // cryptocurrency: [{ currency: 'BITCOIN', base_price: 100000000 }] }, messaging: [{ protocol: 'SMSG', public_key: 'publickey2' }]};


        const listingItem = await this.listingItemFactory.get(message);

        // create listing-item
        return await this.listingItemService.create(listingItem);
    }

}
