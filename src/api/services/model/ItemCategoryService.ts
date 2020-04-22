// Copyright (c) 2017-2020, The Particl Market developers
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
import { hash } from 'omp-lib/dist/hasher/hash';
import { ItemCategoryFactory } from '../../factories/ItemCategoryFactory';
import { ItemCategorySearchParams } from '../../requests/search/ItemCategorySearchParams';

export class ItemCategoryService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemCategoryRepository) public itemCategoryRepo: ItemCategoryRepository,
        @inject(Types.Factory) @named(Targets.Factory.ItemCategoryFactory) private itemCategoryFactory: ItemCategoryFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemCategory>> {
        return this.itemCategoryRepo.findAll();
    }

    /**
     * to search for default categories, use ''
     *
     * @param key
     * @param market
     * @param withRelated
     */
    public async findOneByKeyAndMarket(key: string, market: string, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOneByKeyAndMarket(key, market, withRelated);
        if (itemCategory === null) {
            this.log.warn(`ItemCategory with the key=${key} and market=${market} was not found!`);
            throw new NotFoundException(key);
        }
        return itemCategory;
    }

    public async findOneDefaultByKey(key: string, withRelated: boolean = true): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findOneDefaultByKey(key, withRelated);
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

    public async findRoot(market?: string): Promise<ItemCategory> {
        return await this.itemCategoryRepo.findRoot(market);
    }

    public async findDefaultRoot(): Promise<ItemCategory> {
        return await this.itemCategoryRepo.findDefaultRoot();
    }

    @validate()
    public async search(@request(ItemCategorySearchParams) options: ItemCategorySearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryRepo.search(options, withRelated);
    }

    @validate()
    public async create( @request(ItemCategoryCreateRequest) body: ItemCategoryCreateRequest): Promise<ItemCategory> {

        // If the request body was valid we will create the itemCategory
        const itemCategory: resources.ItemCategory = await this.itemCategoryRepo.create(body).then(value => value.toJSON());

        // finally find and return the created itemCategory
        const newItemCategory = await this.findOne(itemCategory.id);
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
     * create custom market categories (if needed) from array and will return last category <ItemCategory> Model
     *
     * @param market receiveAddress
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    public async createMarketCategoriesFromArray(market: string, categoryArray: string[]): Promise<resources.ItemCategory> {

        const rootCategory: resources.ItemCategory = await this.findRoot(market).then(value => value.toJSON());
        const currentCategoryPath: string[] = [];

        // this.log.debug('categoryArray', categoryArray);
        // loop through the name path, starting from the root, create each one that needs to be created
        for (const categoryName of categoryArray) { // [root, cat0name, cat1name, cat2name, ...]

            currentCategoryPath.push(categoryName);

            await this.itemCategoryFactory.findChildCategoryByPath(currentCategoryPath, rootCategory).catch(async reason => {
                // if there was no child category, then create it
                const createRequest: ItemCategoryCreateRequest = await this.itemCategoryFactory.getCreateRequest(currentCategoryPath, rootCategory);
                await this.create(createRequest);
            });
        }

        return await this.findOneByKeyAndMarket(hash(categoryArray), market).then(value => value.toJSON());
    }



}
