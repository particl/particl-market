import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemLocation } from './ItemLocation';
import { ItemImage } from './ItemImage';
import { ShippingDestination } from './ShippingDestination';
import { ItemCategory } from './ItemCategory';
import { ListingItemTemplate } from './ListingItemTemplate';
import { ListingItem } from './ListingItem';
export declare class ItemInformation extends Bookshelf.Model<ItemInformation> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<ItemInformation>;
    static findByItemTemplateId(value: number, withRelated?: boolean): Promise<ItemInformation>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Title: string;
    ShortDescription: string;
    LongDescription: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ItemCategory(): ItemCategory;
    ItemLocation(): ItemLocation;
    ItemImages(): Collection<ItemImage>;
    ShippingDestinations(): Collection<ShippingDestination>;
    ListingItemTemplate(): ListingItemTemplate;
    ListingItem(): ListingItem;
}
