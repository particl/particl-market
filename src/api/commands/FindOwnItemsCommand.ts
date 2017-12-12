import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItem } from '../models/ListingItem';
import {RpcCommand} from './RpcCommand';
import { ListingItemSearchParams } from '../requests/ListingItemSearchParams';

export class FindOwnItemsCommand implements RpcCommand<Bookshelf.Collection<ListingItem>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'findownitems';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5,
            order: data.params[2] || 'ASC',
            profileId: data.params[3] || 0,
            category: data.params[4],
            searchString: data.params[5] || ''
        } as ListingItemSearchParams, data.params[6]);
    }

    public help(): string {
        return 'FindOwnItemsCommand: TODO: Fill in help string.';
    }
}
