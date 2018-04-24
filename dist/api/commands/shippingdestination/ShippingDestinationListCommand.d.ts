import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemService } from '../../services/ListingItemService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ShippingDestinationListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShippingDestination>> {
    listingItemTemplateService: ListingItemTemplateService;
    listingItemService: ListingItemService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemTemplateService: ListingItemTemplateService, listingItemService: ListingItemService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ShippingDestination>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
