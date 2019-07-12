// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ItemCategoryRepository } from '../../repositories/ItemCategoryRepository';
import { ItemCategory } from '../../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../../requests/model/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import {ConfigurableHasher} from 'omp-lib/dist/hasher/hash';
import {HashableListingItemTemplateConfig} from '../../factories/hashableconfig/model/HashableListingItemTemplateConfig';

export class ItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemCategoryRepository) public itemCategoryRepo: ItemCategoryRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemCategory>> {
        return this.itemCategoryRepo.findAll();
    }

    public async findOneByKey(key: string, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOneByKey(key, withRelated);
        if (itemCategory === null) {
            this.log.warn(`ItemCategory with the key=${key} was not found!`);
            throw new NotFoundException(key);
        }
        return itemCategory;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOne(id, withRelated);
        if (itemCategory === null) {
            this.log.warn(`ItemCategory with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemCategory;
    }

    public async findRoot(): Promise<ItemCategory> {
        return await this.itemCategoryRepo.findRoot();
    }

    public async findByName(name: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryRepo.findByName(name, withRelated);
    }

    @validate()
    public async create( @request(ItemCategoryCreateRequest) body: ItemCategoryCreateRequest): Promise<ItemCategory> {

        // If the request body was valid we will create the itemCategory
        const itemCategory = await this.itemCategoryRepo.create(body);

        // finally find and return the created itemCategory
        const newItemCategory = await this.findOne(itemCategory.Id);
        return newItemCategory;
    }

    @validate()
    public async update(id: number, @request(ItemCategoryUpdateRequest) body: ItemCategoryUpdateRequest, patching: boolean = true): Promise<ItemCategory> {
        // find the existing one without related
        const itemCategory = await this.findOne(id, false);

        // set new values
        itemCategory.Name = body.name;
        itemCategory.Description = body.description;

        if (body.parent_item_category_id) {
            itemCategory.set('parentItemCategoryId', body.parent_item_category_id);
        }

        // update itemCategory record
        const updatedItemCategory = await this.itemCategoryRepo.update(id, itemCategory.toJSON(), patching);
        return updatedItemCategory;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemCategoryRepo.destroy(id);
    }

    /**
     * create custom categories (if needed) from array and will return last category <ItemCategory> Model
     *
     * @param market receiveAddress
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    public async createCustomCategoriesFromArray(market: string, categoryArray: string[]): Promise<resources.ItemCategory> {

        let rootCategoryToSearchFrom: resources.ItemCategory = await this.findRoot().then(value => value.toJSON());

        // this.log.debug('categoryArray', categoryArray);
        for (const categoryKeyOrName of categoryArray) { // [cat0, cat1, cat2, cat3, cat4]

            // todo: findChildCategoryByKeyOrName throws, propably doesnt work very well
            let existingCategory = await this.findChildCategoryByKeyOrName(rootCategoryToSearchFrom, categoryKeyOrName);

            if (!existingCategory) {

                // category did not exist, so we need to create it
                const categoryCreateRequest = {
                    name: categoryKeyOrName,
                    market,
                    parent_item_category_id: rootCategoryToSearchFrom.id
                } as ItemCategoryCreateRequest;
                categoryCreateRequest.key = ConfigurableHasher.hash(categoryCreateRequest, new HashableListingItemTemplateConfig());

                // create and assign it as existingCategoru
                existingCategory = await this.create(categoryCreateRequest).then(value => value.toJSON());

            } else {
                // category exists, fetch it
                existingCategory = await this.findOneByKey(categoryKeyOrName).then(value => value.toJSON());
            }
            rootCategoryToSearchFrom = existingCategory;
        }

        // return the last category
        return rootCategoryToSearchFrom;
    }

    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    public async findChildCategoryByKeyOrName(rootCategory: resources.ItemCategory, keyOrName: string): Promise<resources.ItemCategory> {

        if (rootCategory.key === keyOrName) {
            // root case
            return rootCategory;
        } else {
            // searchBy the children for a match
            const childCategories = rootCategory.ChildItemCategories;
            const found = _.find(childCategories, (childCategory) => {
                return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
            });
            if (found) {
                return found;
            } else {
                throw new NotFoundException(keyOrName);
            }
        }
    }

}
