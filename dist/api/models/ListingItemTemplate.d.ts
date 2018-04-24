import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
import { ItemInformation } from './ItemInformation';
import { PaymentInformation } from './PaymentInformation';
import { MessagingInformation } from './MessagingInformation';
import { ListingItemObject } from './ListingItemObject';
import { ListingItem } from './ListingItem';
import { Profile } from './Profile';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';
export declare class ListingItemTemplate extends Bookshelf.Model<ListingItemTemplate> {
    static RELATIONS: string[];
    static fetchById(value: number, withRelated?: boolean): Promise<ListingItemTemplate>;
    static fetchByHash(value: string, withRelated?: boolean): Promise<ListingItemTemplate>;
    static searchBy(options: ListingItemTemplateSearchParams, withRelated?: boolean): Promise<Collection<ListingItemTemplate>>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Hash: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ItemInformation(): ItemInformation;
    PaymentInformation(): PaymentInformation;
    MessagingInformation(): Collection<MessagingInformation>;
    ListingItemObjects(): Collection<ListingItemObject>;
    ListingItems(): Collection<ListingItem>;
    Profile(): Profile;
}
