import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import {RpcCommand} from './RpcCommand';

export class ListingItemFindByCategoryCommand implements RpcCommand<any> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'listingitem.findbycategory';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        const listingItems = await this.listingItemService.findByCategory(data.params[0]);
        // this.log.debug('listingItems:', listingItems.toJSON());
        listingItems.toJSON().forEach(item => {
            this.log.debug('item:', item.ItemInformation.title);
        });
        return listingItems;
    }

    public help(): string {
        return 'ListingItemFindByCategoryCommand: TODO: Fill in help string.';
    }
}
