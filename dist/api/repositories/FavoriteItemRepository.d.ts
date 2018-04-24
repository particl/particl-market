import * as Bookshelf from 'bookshelf';
import { FavoriteItem } from '../models/FavoriteItem';
import { Logger as LoggerType } from '../../core/Logger';
import { FavoriteSearchParams } from '../requests/FavoriteSearchParams';
export declare class FavoriteItemRepository {
    FavoriteItemModel: typeof FavoriteItem;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(FavoriteItemModel: typeof FavoriteItem, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<FavoriteItem>>;
    findOne(id: number, withRelated?: boolean): Promise<FavoriteItem>;
    /**
     * search favorite item by profile id and item id
     * @param options, FavoriteSearchParams
     * @returns {Promise<FavoriteItem> }
     */
    search(options: FavoriteSearchParams): Promise<FavoriteItem>;
    findFavoritesByProfileId(profileId: number, withRelated: boolean): Promise<Bookshelf.Collection<FavoriteItem>>;
    create(data: any): Promise<FavoriteItem>;
    update(id: number, data: any): Promise<FavoriteItem>;
    destroy(id: number): Promise<void>;
}
