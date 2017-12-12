import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItem } from '../models/ListingItem';
import {RpcCommand} from './RpcCommand';
import { NotFoundException } from '../exceptions/NotFoundException';

export class GetItemCommand implements RpcCommand<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'getitem';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItem> {
        let listingItem;

        if (typeof data.params[0] === 'number') {
            listingItem = await this.listingItemService.findOne(data.params[0]);
        } else {
            listingItem = await this.listingItemService.findOneByHash(data.params[0]);
        }

        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        }
        return listingItem;
    }

    public help(): string {
        return 'GetItemCommand: TODO: Fill in help string.';
    }
}
