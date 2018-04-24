import { Bookshelf } from '../../config/Database';
import { ListingItem } from './ListingItem';
export declare class FlaggedItem extends Bookshelf.Model<FlaggedItem> {
    static fetchById(value: number, withRelated?: boolean): Promise<FlaggedItem>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    ListingItemId: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    ListingItem(): ListingItem;
}
