import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { ProfileService } from '../../services/ProfileService';
import { FavoriteItemService } from '../../services/FavoriteItemService';
export declare class FavoriteListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {
    Logger: typeof LoggerType;
    private profileService;
    private favoriteItemService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, profileService: ProfileService, favoriteItemService: FavoriteItemService);
    /**
     *
     * data.params[]:
     *  [0]: profileId or profileName
     *  [1]: withRelated, boolean
     *
     * if data.params[0] is number then find favorites by profileId else find  by profile Name
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<FavoriteItem>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
