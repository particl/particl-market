import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemGetCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {
    Logger: typeof LoggerType;
    listingItemService: ListingItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemService: ListingItemService);
    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data: RpcRequest): Promise<ListingItem>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
