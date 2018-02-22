import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { FlaggedItem } from '../models/FlaggedItem';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class FlaggedItemRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.FlaggedItem) public FlaggedItemModel: typeof FlaggedItem,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<FlaggedItem>> {
        const list = await this.FlaggedItemModel.fetchAll();
        return list as Bookshelf.Collection<FlaggedItem>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FlaggedItem> {
        return this.FlaggedItemModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<FlaggedItem> {
        const flaggedItem = this.FlaggedItemModel.forge<FlaggedItem>(data);
        try {
            const flaggedItemCreated = await flaggedItem.save();
            return this.FlaggedItemModel.fetchById(flaggedItemCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the flaggedItem!', error);
        }
    }

    public async update(id: number, data: any): Promise<FlaggedItem> {
        const flaggedItem = this.FlaggedItemModel.forge<FlaggedItem>({ id });
        try {
            const flaggedItemUpdated = await flaggedItem.save(data, { patch: true });
            return this.FlaggedItemModel.fetchById(flaggedItemUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the flaggedItem!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let flaggedItem = this.FlaggedItemModel.forge<FlaggedItem>({ id });
        try {
            flaggedItem = await flaggedItem.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await flaggedItem.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the flaggedItem!', error);
        }
    }

}
