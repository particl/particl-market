import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItem } from '../models/ListingItem';
import {RpcCommand} from './RpcCommand';

export class ListingItemFindAllCommand implements RpcCommand<Bookshelf.Collection<ListingItem>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'listingitem.findall';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return await this.listingItemService.findAll();
    }

    public help(): string {
        return 'ListingItemFindAllCommand: TODO: Fill in help string.';
    }
}
