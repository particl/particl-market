import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { FavoriteItemRepository } from '../repositories/FavoriteItemRepository';
import { FavoriteItem } from '../models/FavoriteItem';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';
import { FavoriteItemUpdateRequest } from '../requests/FavoriteItemUpdateRequest';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';
import { ListingItemService } from './ListingItemService';
import { ProfileService } from './ProfileService';
export declare class FavoriteItemService {
    favoriteItemRepo: FavoriteItemRepository;
    listingItemService: ListingItemService;
    profileService: ProfileService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(favoriteItemRepo: FavoriteItemRepository, listingItemService: ListingItemService, profileService: ProfileService, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<FavoriteItem>>;
    findOne(id: number, withRelated?: boolean): Promise<FavoriteItem>;
    /**
     * search favorite item using given FavoriteSearchParams
     *
     * @param options
     * @returns {Promise<FavoriteItem> }
     */
    search(options: FavoriteSearchParams): Promise<FavoriteItem>;
    /**
     * find favorite item by profileId
     *
     * @param profileId
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>> }
     */
    findFavoritesByProfileId(profileId: number, withRelated: boolean): Promise<Bookshelf.Collection<FavoriteItem>>;
    create(body: FavoriteItemCreateRequest): Promise<FavoriteItem>;
    update(id: number, body: FavoriteItemUpdateRequest): Promise<FavoriteItem>;
    destroy(id: number): Promise<void>;
    /**
     * search favorite item using given FavoriteSearchParams
     * when itemId is string then find by item hash
     * when profileId is string then find by profile name
     *
     * @param options
     * @returns {Promise<FavoriteSearchParams> }
     */
    private checkSearchByItemHashOrProfileName(options);
}
