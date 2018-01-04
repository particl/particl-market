import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemPrice } from '../models/ItemPrice';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ItemPriceRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemPrice) public ItemPriceModel: typeof ItemPrice,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemPrice>> {
        const list = await this.ItemPriceModel.fetchAll();
        return list as Bookshelf.Collection<ItemPrice>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemPrice> {
        return this.ItemPriceModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ItemPrice> {
        const itemPrice = this.ItemPriceModel.forge<ItemPrice>(data);
        try {
            const itemPriceCreated = await itemPrice.save();
            return this.ItemPriceModel.fetchById(itemPriceCreated.id);
        } catch (error) {
            this.log.error(error);
            throw new DatabaseException('Could not create the itemPrice!', error);
        }
    }

    public async update(id: number, data: any): Promise<ItemPrice> {
        const itemPrice = this.ItemPriceModel.forge<ItemPrice>({ id });
        try {
            const itemPriceUpdated = await itemPrice.save(data, { patch: true });
            return this.ItemPriceModel.fetchById(itemPriceUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemPrice!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemPrice = this.ItemPriceModel.forge<ItemPrice>({ id });
        try {
            itemPrice = await itemPrice.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemPrice.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemPrice!', error);
        }
    }

}
