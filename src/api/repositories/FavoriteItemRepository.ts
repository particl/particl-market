import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { FavoriteItem } from '../models/FavoriteItem';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class FavoriteItemRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.FavoriteItem) public FavoriteItemModel: typeof FavoriteItem,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<FavoriteItem>> {
        const list = await this.FavoriteItemModel.fetchAll();
        return list as Bookshelf.Collection<FavoriteItem>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FavoriteItem> {
        return this.FavoriteItemModel.fetchById(id, withRelated);
    }

    public async findByItemAndProfile(data: any): Promise<FavoriteItem> {
        return this.FavoriteItemModel.fetchByItemAndProfile(data[0], data[1]);
    }

    public async create(data: any): Promise<FavoriteItem> {
        const favoriteItem = this.FavoriteItemModel.forge<FavoriteItem>(data);
        try {
            const favoriteItemCreated = await favoriteItem.save();
            return this.FavoriteItemModel.fetchById(favoriteItemCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the favoriteItem!', error);
        }
    }

    public async update(id: number, data: any): Promise<FavoriteItem> {
        const favoriteItem = this.FavoriteItemModel.forge<FavoriteItem>({ id });
        try {
            const favoriteItemUpdated = await favoriteItem.save(data, { patch: true });
            return this.FavoriteItemModel.fetchById(favoriteItemUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the favoriteItem!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let favoriteItem = this.FavoriteItemModel.forge<FavoriteItem>({ id });
        try {
            favoriteItem = await favoriteItem.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await favoriteItem.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the favoriteItem!', error);
        }
    }

}
