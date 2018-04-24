import * as Bookshelf from 'bookshelf';
import { ItemCategory } from '../models/ItemCategory';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ItemCategoryRepository {
    ItemCategoryModel: typeof ItemCategory;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ItemCategoryModel: typeof ItemCategory, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemCategory>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemCategory>;
    findOneByKey(key: string, withRelated?: boolean): Promise<ItemCategory>;
    findRoot(): Promise<ItemCategory>;
    findByName(name: string, withRelated?: boolean): Promise<Bookshelf.Collection<ItemCategory>>;
    isCategoryExists(categoryName: string, parentCategoryId: number | null): Promise<ItemCategory>;
    create(data: any): Promise<ItemCategory>;
    update(id: number, data: any, patching?: boolean): Promise<ItemCategory>;
    destroy(id: number): Promise<void>;
}
