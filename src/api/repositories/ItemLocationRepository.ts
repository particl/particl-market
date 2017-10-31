import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemLocation } from '../models/ItemLocation';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ItemLocationRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemLocation) public ItemLocationModel: typeof ItemLocation,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemLocation>> {
        const list = await this.ItemLocationModel.fetchAll();
        return list as Bookshelf.Collection<ItemLocation>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemLocation> {
        return this.ItemLocationModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ItemLocation> {
        const itemLocation = this.ItemLocationModel.forge<ItemLocation>(data);
        try {
            const itemLocationCreated = await itemLocation.save();
            return this.ItemLocationModel.fetchById(itemLocationCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the itemLocation!', error);
        }
    }

    public async update(id: number, data: any): Promise<ItemLocation> {
        const itemLocation = this.ItemLocationModel.forge<ItemLocation>({ id });
        try {
            const itemLocationUpdated = await itemLocation.save(data, { patch: true });
            return this.ItemLocationModel.fetchById(itemLocationUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemLocation!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemLocation = this.ItemLocationModel.forge<ItemLocation>({ id });
        try {
            itemLocation = await itemLocation.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemLocation.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemLocation!', error);
        }
    }

}
