// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategorySearchParams } from '../requests/search/ItemCategorySearchParams';

export class ItemCategoryRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemCategory) public ItemCategoryModel: typeof ItemCategory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemCategory>> {
        const list = await this.ItemCategoryModel.fetchAll();
        return list as Bookshelf.Collection<ItemCategory>;
    }

    public async findOne(id: number, withRelated: boolean = true, parentRelations: boolean = true): Promise<ItemCategory> {
        return this.ItemCategoryModel.fetchById(id, withRelated, parentRelations);
    }

    /**
     *
     * @param key
     * @param market
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findOneByKeyAndMarket(key: string, market: string, withRelated: boolean = true, parentRelations: boolean = true): Promise<ItemCategory> {
        return this.ItemCategoryModel.fetchByKeyAndMarket(key, market, withRelated, parentRelations);
    }

    /**
     *
     * @param key
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findOneDefaultByKey(key: string, withRelated: boolean = true, parentRelations: boolean = true): Promise<ItemCategory> {
        return this.ItemCategoryModel.fetchDefaultByKey(key, withRelated, parentRelations);
    }

    /**
     *
     * @param market
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findRoot(market?: string, withRelated: boolean = true, parentRelations: boolean = false): Promise<ItemCategory> {
        if (market) {
            return await this.ItemCategoryModel.fetchRoot(market, withRelated, parentRelations);
        } else {
            return await this.ItemCategoryModel.fetchDefaultRoot(withRelated, parentRelations);
        }
    }

    /**
     *
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async findDefaultRoot(withRelated: boolean = true, parentRelations: boolean = false): Promise<ItemCategory> {
        return await this.ItemCategoryModel.fetchDefaultRoot(withRelated, parentRelations);
    }

    /**
     *
     * @param options
     * @param withRelated, return results with relations
     * @param parentRelations, true (default): return results with multiple levels of parent relations,
     *                         false: return with multiple child relations, basicly the full category tree
     */
    public async search(options: ItemCategorySearchParams, withRelated: boolean, parentRelations: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return this.ItemCategoryModel.searchBy(options, withRelated, parentRelations);
    }

    public async create(data: any): Promise<ItemCategory> {
        const itemCategory = this.ItemCategoryModel.forge<ItemCategory>(data);
        try {
            const itemCategoryCreated = await itemCategory.save();
            return this.ItemCategoryModel.fetchById(itemCategoryCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the itemCategory!', error);
        }
    }

    public async update(id: number, data: any, patching: boolean = true): Promise<ItemCategory> {
        const itemCategory = this.ItemCategoryModel.forge<ItemCategory>({ id });
        try {

            const itemCategoryUpdated = await itemCategory.save(data, { defaults: true, patch: patching });
            return await this.ItemCategoryModel.fetchById(itemCategoryUpdated.id);

        } catch (error) {
            throw new DatabaseException('Could not update the itemCategory!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemCategory = this.ItemCategoryModel.forge<ItemCategory>({ id });
        try {
            itemCategory = await itemCategory.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemCategory.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemCategory!', error);
        }
    }

}
