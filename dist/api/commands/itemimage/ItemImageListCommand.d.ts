import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemImageListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemImage>> {
    listingItemTemplateService: ListingItemTemplateService;
    listingItemService: ListingItemService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemTemplateService: ListingItemTemplateService, listingItemService: ListingItemService, Logger: typeof LoggerType);
    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<ItemImage>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
