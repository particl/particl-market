// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core } from '../../../constants';
import { ItemCategoryCreateRequest } from '../../requests/model/ItemCategoryCreateRequest';
import { hash } from 'omp-lib/dist/hasher/hash';
import { MessageException } from '../../exceptions/MessageException';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ItemCategoryCreateParams } from '../ModelCreateParams';

export class ItemCategoryFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param params
     */
    public async get(params: ItemCategoryCreateParams): Promise<ItemCategoryCreateRequest> {

        const createRequest = {
            parent_item_category_id: params.parentCategory.id,
            market: params.parentCategory.market,
            key: hash(params.fullCategoryPath.toString()),
            name: _.last(params.fullCategoryPath),
            description: _.join(params.fullCategoryPath, ' / ')
        } as ItemCategoryCreateRequest;

        return createRequest;
    }

    public keyForItemCategoryArray(categoryArray: string[]): string {
        return hash(categoryArray.toString());
    }

    public keyForItemCategory(category: resources.ItemCategory): string {
        const path: string[] = this.getArray(category);
        return hash(path.toString());
    }

    /**
     * Converts a category to an array of category names
     * ['rootcatkey', 'subcatkey', ..., 'catkey']
     *
     * @param category : resources.ItemCategory
     * @returns {Promise<string[]>}
     */
    public getArray(category: resources.ItemCategory): string[] {
        if (!category) {
            throw new MessageException('Missing category.');
        }
        return this.getArrayInner(category);
    }

    /**
     * add the parent category name to the front of categoryArray until the root is reached
     *
     * @param {"resources".ItemCategory} category
     * @param {string[]} categoryArray
     * @returns {Promise<string[]>}
     */
    private getArrayInner(category: resources.ItemCategory, categoryArray: string[] = []): string[] {

        categoryArray.unshift(category.name);

        // if category has ParentItemCategory, add it's key to array
        if (!_.isEmpty(category.ParentItemCategory)) {
            // note, currently we only have 4 levels of parents in the model
            return this.getArrayInner(category.ParentItemCategory, categoryArray);
        }
        return categoryArray;
    }
}
