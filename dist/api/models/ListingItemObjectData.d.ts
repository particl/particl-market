import { Bookshelf } from '../../config/Database';
import { ListingItemObject } from './ListingItemObject';
export declare class ListingItemObjectData extends Bookshelf.Model<ListingItemObjectData> {
    static fetchById(value: number, withRelated?: boolean): Promise<ListingItemObjectData>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Key: string;
    Value: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ListingItemObject(): ListingItemObject;
}
