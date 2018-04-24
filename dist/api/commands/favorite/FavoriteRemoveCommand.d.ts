import { Logger as LoggerType } from '../../../core/Logger';
import { FavoriteItemService } from '../../services/FavoriteItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
/**
 * Command for removing an item from your favorites, identified by ID or hash.
 */
export declare class FavoriteRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private favoriteItemService;
    private listingItemService;
    private profileService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, favoriteItemService: FavoriteItemService, listingItemService: ListingItemService, profileService: ProfileService);
    /**
     *
     *  data.params[]:
     *  [0]: profile_id or null if null then use the default profile
     *  [1]: item_id or hash
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: item_id or hash
     *  [1]: profile_id or null
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     */
    private getSearchParams(data);
}
