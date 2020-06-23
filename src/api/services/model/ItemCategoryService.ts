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

    /**
     *
     * @param market
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findRoot(market?: string, withRelated: boolean = true, parentRelations: boolean = false): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findRoot(market, withRelated, parentRelations);
        if (itemCategory === null) {
            this.log.warn(`The ROOT ItemCategory for the market=${market} was not found!`);
            throw new NotFoundException(market);
        }
        return itemCategory;
    }

    /**
     *
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findDefaultRoot(withRelated: boolean = true, parentRelations: boolean = false): Promise<ItemCategory> {
        const itemCategory = await this.itemCategoryRepo.findDefaultRoot(withRelated, parentRelations);
        if (itemCategory === null) {
            // this should NEVER happen
            this.log.warn(`The default ROOT ItemCategory was not found!`);
            throw new NotFoundException('ROOT');
        }
        return itemCategory;
    }

    /**
     *
     * @param options
     * @param withRelated, return results with relations
     */
    @validate()
    public async search(@request(ItemCategorySearchParams) options: ItemCategorySearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryRepo.search(options, withRelated);
    }

    @validate()
    public async create( @request(ItemCategoryCreateRequest) body: ItemCategoryCreateRequest): Promise<ItemCategory> {
        // this.log.debug('create(), body:', JSON.stringify(body, null, 2));
        const itemCategory: resources.ItemCategory = await this.itemCategoryRepo.create(body).then(value => value.toJSON());
        // this.log.debug('create(), itemCategory:', JSON.stringify(itemCategory, null, 2));

        return await this.findOne(itemCategory.id);
    }

    @validate()
    public async update(id: number, @request(ItemCategoryUpdateRequest) body: ItemCategoryUpdateRequest, patching: boolean = true): Promise<ItemCategory> {

        const itemCategory = await this.findOne(id, false);
        itemCategory.Name = body.name;
        itemCategory.Key = body.key;
        itemCategory.Description = body.description;

        if (body.parent_item_category_id) {
            itemCategory.set('parentItemCategoryId', body.parent_item_category_id);
        }

        return await this.itemCategoryRepo.update(id, itemCategory.toJSON(), patching);
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

        // this.log.debug('createMarketCategoriesFromArray(), market:', market);
        // this.log.debug('createMarketCategoriesFromArray(), categoryArray:', categoryArray);

        await this.findRoot(market)
            .then(value => value.toJSON())
            .catch(async reason => {
                // if root category for the market didn't exist, create it
                // todo: we should propably/also make sure the root category is being created when market is created
                this.log.error('rootCategory not found, fixing it...');
                return await this.insertRootItemCategoryForMarket(market)
                    .then(value => {
                        const root = value.toJSON();
                        // this.log.debug('createMarketCategoriesFromArray(), new ROOT:', JSON.stringify(root, null, 2));
                        return root;
                    });
            });

        const currentPathToLookFor: string[] = [];
        let index = 0;
        let parentCategory: resources.ItemCategory;

        // loop through the categoryName path, starting from the root, creating each one that needs to be created
        for (const categoryName of categoryArray) {     // [ROOT, cat0name, cat1name, cat2name, ...]

            // first: [ROOT], then: [ROOT, cat0name], then: [ROOT, cat0name, cat1name]
            currentPathToLookFor[index] = categoryName;
            this.log.debug('createMarketCategoriesFromArray(), currentPathToLookFor: ', currentPathToLookFor);
            index++;

            const keyForPath = hash(currentPathToLookFor.toString());

            // if category for the key and market isn't found, create it
            parentCategory = await this.findOneByKeyAndMarket(keyForPath, market)
                .then(value => value.toJSON())
                .catch(async reason => {
                    this.log.debug('createMarketCategoriesFromArray(), missing category: ' + keyForPath + ', for market: ' + market);
                    // there was no child category, then create it
                    // root should have always been found, so parentCategory is always set
                    const createRequest: ItemCategoryCreateRequest = await this.itemCategoryFactory.getCreateRequest(currentPathToLookFor, parentCategory);
                    // this.log.debug('createMarketCategoriesFromArray(), createRequest:', JSON.stringify(createRequest, null, 2));

                    return await this.create(createRequest).then(value => value.toJSON());
                });
        }

        const category: resources.ItemCategory = await this.findOneByKeyAndMarket(hash(categoryArray.toString()), market).then(value => value.toJSON());
        // this.log.debug('createMarketCategoriesFromArray(), category:', JSON.stringify(category, null, 2));

        return category;
    }

    public async insertRootItemCategoryForMarket(market: string): Promise<ItemCategory> {

        const categoryRequest = {
            name: 'ROOT',
            description: 'root item category for market: ' + market,
            market
        } as ItemCategoryCreateRequest;

        const path: string[] = [categoryRequest.name];
        categoryRequest.key = hash(path.toString());

        return this.insertOrUpdate(categoryRequest);
    }

    public async insertOrUpdate(categoryRequest: ItemCategoryCreateRequest | ItemCategoryUpdateRequest): Promise<ItemCategory> {

        const updated = await this.findOneByKeyAndMarket(categoryRequest.key, categoryRequest.market)
            .then(async found => {
                const category: resources.ItemCategory = found.toJSON();
                // this.log.debug('insertOrUpdate(), found:', category.id);
                return await this.update(category.id, categoryRequest as ItemCategoryUpdateRequest);
            })
            .catch(async reason => {
                // this.log.debug('insertOrUpdate(), not found');
                return await this.create(categoryRequest as ItemCategoryCreateRequest);
            });

        // this.log.debug('insertOrUpdate(), updated: ', JSON.stringify(updated, null, 2));
        return updated;
    }

    /**
     * key = hash of path[]
     *
     * @param categoryRequest
     * @param parents
     */
    public async insertOrUpdateCategory(categoryRequest: ItemCategoryCreateRequest | ItemCategoryUpdateRequest,
                                        parents?: resources.ItemCategory[]): Promise<resources.ItemCategory> {

        const path: string[] = [];

        if (parents) {
            // this.log.debug('insertOrUpdateCategory(), parents: ', parents);
            const parent = _.last(parents);
            if (parent) {
                categoryRequest.parent_item_category_id = parent.id;
            }

            // tslint:disable:no-for-each-push
            _.forEach(parents, value => {
                path.push(value.name);
            });
        }
        path.push(categoryRequest.name);

        // key is a hash of the path array
        categoryRequest.key = hash(path.toString());

        // this.log.debug('insertOrUpdateCategory(), categoryRequest: ', JSON.stringify(categoryRequest, null, 2));

        const category: resources.ItemCategory = await this.insertOrUpdate(categoryRequest)
            .then(value => value.toJSON());
        // this.log.debug('insertOrUpdateCategory(), ' + path.toString() + ': ', category.id);
        return category;
    }


}
