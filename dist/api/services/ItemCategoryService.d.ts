import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategoryRepository } from '../repositories/ItemCategoryRepository';
import { ItemCategory } from '../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../requests/ItemCategoryUpdateRequest';
import * as resources from 'resources';
export declare class ItemCategoryService {
    itemCategoryRepo: ItemCategoryRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemCategoryRepo: ItemCategoryRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemCategory>>;
    findOneByKey(key: string, withRelated?: boolean): Promise<ItemCategory>;
    findOne(id: number, withRelated?: boolean): Promise<ItemCategory>;
    findRoot(): Promise<ItemCategory>;
    findByName(name: string, withRelated?: boolean): Promise<Bookshelf.Collection<ItemCategory>>;
    isCategoryExists(categoryName: string, parentCategory: ItemCategory): Promise<ItemCategory>;
    create(body: ItemCategoryCreateRequest): Promise<ItemCategory>;
    update(id: number, body: ItemCategoryUpdateRequest, patching?: boolean): Promise<ItemCategory>;
    destroy(id: number): Promise<void>;
    /**
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    createCategoriesFromArray(categoryArray: string[]): Promise<resources.ItemCategory>;
    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    findChildCategoryByKeyOrName(rootCategory: resources.ItemCategory, keyOrName: string): Promise<resources.ItemCategory>;
}
