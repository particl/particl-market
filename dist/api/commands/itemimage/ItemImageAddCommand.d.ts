import { Logger as LoggerType } from '../../../core/Logger';
import { ItemImageService } from '../../services/ItemImageService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemImageAddCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {
    Logger: typeof LoggerType;
    private itemImageService;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemImageService: ItemImageService, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: dataId
     *  [2]: protocol
     *  [3]: encoding
     *  [4]: data
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    execute(data: RpcRequest): Promise<ItemImage>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
