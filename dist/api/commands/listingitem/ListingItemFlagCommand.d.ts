import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemService } from '../../services/ListingItemService';
import { FlaggedItemService } from '../../services/FlaggedItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { FlaggedItem } from '../../models/FlaggedItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<FlaggedItem> {
    Logger: typeof LoggerType;
    listingItemService: ListingItemService;
    flaggedItemService: FlaggedItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemService: ListingItemService, flaggedItemService: FlaggedItemService);
    /**
     * data.params[]:
     *  [0]: listingItemId or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<FlaggedItem>}
     */
    execute(data: RpcRequest): Promise<FlaggedItem>;
    usage(): string;
    help(): string;
    description(): string;
}
