import { Collection } from 'bookshelf';
import { Bookshelf } from '../../config/Database';
import { ListingItem } from './ListingItem';
import { ListingItemTemplate } from './ListingItemTemplate';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';
import { ListingItemObjectData } from './ListingItemObjectData';
export declare class ListingItemObject extends Bookshelf.Model<ListingItemObject> {
    static fetchById(value: number, withRelated?: boolean): Promise<ListingItemObject>;
    static searchBy(options: ListingItemObjectSearchParams): Promise<Collection<ListingItemObject>>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Type: string;
    ObjectId: string;
    ForceInput: string;
    Description: string;
    Order: number;
    UpdatedAt: Date;
    CreatedAt: Date;
    ListingItem(): ListingItem;
    ListingItemTemplate(): ListingItemTemplate;
    ListingItemObjectDatas(): Collection<ListingItemObjectData>;
}
