import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from './ListingItemService';
import { NotFoundException } from '../exceptions/NotFoundException';
import * as Bookshelf from 'bookshelf';

export class RpcListingItemService {

    public log: LoggerType;

        constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async getItems( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemService.getListingItems(data);
    }

    @validate()
    public async getItemByHash(@request(RpcRequest) body: any): Promise<ListingItem> {
        const listingItem = await this.listingItemService.findOneByHash(body.params[0]);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${body.params[0]} was not found!`);
            throw new NotFoundException(body.params[0]);
        }
        return listingItem;
    }

    @validate()
    public async rpcSearchByCategoryIdOrName(@request(RpcRequest) body: any): Promise<Bookshelf.Collection<ListingItem>> {
        const listingItem = await this.listingItemService.searchByCategoryIdOrName(body.params);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the category=${body.params[0]} was not found!`);
            throw new NotFoundException(body.params[0]);
        }
        return listingItem;
    }

}
