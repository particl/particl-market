// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core } from '../../constants';
import { ItemCategoryCreateRequest } from '../requests/model/ItemCategoryCreateRequest';
import { NotFoundException } from '../exceptions/NotFoundException';
import { hash } from 'omp-lib/dist/hasher/hash';
import { MessageException } from '../exceptions/MessageException';

export class ItemCategoryFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param fullCategoryPath
     * @param rootCategory
     * @returns ItemCategoryCreateRequest
     */
    public async getCreateRequest(fullCategoryPath: string[], rootCategory: resources.ItemCategory): Promise<ItemCategoryCreateRequest> {
        const parentCategoryPath = [...fullCategoryPath];
        parentCategoryPath.pop(); // remove last

        const parentCategory: resources.ItemCategory = await this.findChildCategoryByPath(parentCategoryPath, rootCategory);

        const createRequest = {
            parent_item_category_id: parentCategory.id,
            market: rootCategory.market,
            key: hash(fullCategoryPath),
            name: _.last(fullCategoryPath),
            description: _.join(fullCategoryPath, ' / ')
        } as ItemCategoryCreateRequest;

        return createRequest;
    }


    /**
     * key is the hash of the path
     * @param category : resources.ItemCategory
     * @returns string
     */
    public async calculateKey(category: resources.ItemCategory): Promise<string> {
        const path: string[] = await this.getArray(category);
        return hash(path.toString());
    }

    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} parentCategory
     * @param name
     * @returns {Promise<"resources".ItemCategory>}
     */
    public async findChildCategoryByName(parentCategory: resources.ItemCategory, name: string): Promise<resources.ItemCategory> {

        if (parentCategory.name === name) {
            // root case
            return parentCategory;
        } else {
            const found = _.find(parentCategory.ChildItemCategories, (childCategory) => {
                return childCategory.name === name;
            });
            if (found) {
                return found;
            } else {
                throw new NotFoundException(name);
            }
        }
    }

    public async findChildCategoryByPath(path: string[], rootCategory: resources.ItemCategory): Promise<resources.ItemCategory> {

        let parentCategory: resources.ItemCategory = JSON.parse(JSON.stringify(rootCategory));

        for (const categoryName of path) { // [root, parentCategoryPath, newOne]
            const found = _.find(parentCategory.ChildItemCategories, (childCategory) => {
                return childCategory.name === categoryName;
            });

            if (!found) {
                throw new NotFoundException(categoryName);
            }
            parentCategory = found;

        }

        return parentCategory;
    }

    /**
     * Converts a category to an array of category names
     * ['rootcatkey', 'subcatkey', ..., 'catkey']
     *
     * @param category : resources.ItemCategory
     * @returns {Promise<string[]>}
     */
    public async getArray(category: resources.ItemCategory): Promise<string[]> {
        if (!category) {
            throw new MessageException('Missing category.');
        }
        return await this.getArrayInner(category);
    }

    /**
     * add the parent category name to the front of categoryArray until the root is reached
     *
     * @param {"resources".ItemCategory} category
     * @param {string[]} categoryArray
     * @returns {Promise<string[]>}
     */
    private async getArrayInner(category: resources.ItemCategory, categoryArray: string[] = []): Promise<string[]> {

        categoryArray.unshift(category.name);

        // if category has ParentItemCategory, add it's key to array
        if (!_.isEmpty(category.ParentItemCategory)) {
            // note, currently we only have 4 levels of parents in the model
            return await this.getArrayInner(category.ParentItemCategory, categoryArray);
        }
        return categoryArray;
    }


}
