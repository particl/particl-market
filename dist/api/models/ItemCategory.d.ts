import { Bookshelf } from '../../config/Database';
import { Collection } from 'bookshelf';
export declare class ItemCategory extends Bookshelf.Model<ItemCategory> {
    static fetchById(value: number, withRelated?: boolean): Promise<ItemCategory>;
    static fetchByKey(key: string, withRelated?: boolean): Promise<ItemCategory>;
    static fetchRoot(): Promise<ItemCategory>;
    static fetchAllByName(name: string, withRelated?: boolean): Promise<Collection<ItemCategory>>;
    static fetchCategoryByNameAndParentID(categoryName: string, parentCategoryId: number | null): Promise<ItemCategory>;
    readonly tableName: string;
    readonly hasTimestamps: boolean;
    Id: number;
    Name: string;
    Key: string;
    Description: string;
    UpdatedAt: Date;
    CreatedAt: Date;
    ParentItemCategory(): ItemCategory;
    ChildItemCategories(): Collection<ItemCategory>;
}
