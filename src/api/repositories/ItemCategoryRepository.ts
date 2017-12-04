import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemCategory } from '../models/ItemCategory';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

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

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemCategory> {
        return this.ItemCategoryModel.fetchById(id, withRelated);
    }

    public async findOneByKey(key: string, withRelated: boolean = true): Promise<ItemCategory> {
        return this.ItemCategoryModel.fetchByKey(key, withRelated);
    }

    public async findRoot(): Promise<ItemCategory> {
        return await this.ItemCategoryModel.fetchRoot();
    }

    public async findByName(name: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ItemCategory>> {
        return this.ItemCategoryModel.fetchAllByName(name, withRelated);
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
           // this.log.debug('data: ', data);

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
