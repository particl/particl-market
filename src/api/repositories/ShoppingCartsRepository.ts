import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ShoppingCarts } from '../models/ShoppingCarts';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShoppingCartsRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ShoppingCarts) public ShoppingCartsModel: typeof ShoppingCarts,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCarts>> {
        const list = await this.ShoppingCartsModel.fetchAll();
        return list as Bookshelf.Collection<ShoppingCarts>;
    }

    public async findAllByProfile(searchParam: number | string): Promise<Bookshelf.Collection<ShoppingCarts>> {
        const list = await this.ShoppingCartsModel.fetchAllByProfile(searchParam);
        return list as Bookshelf.Collection<ShoppingCarts>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCarts> {
        return this.ShoppingCartsModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ShoppingCarts> {
        const shoppingCarts = this.ShoppingCartsModel.forge<ShoppingCarts>(data);
        try {
            const shoppingCartsCreated = await shoppingCarts.save();
            return this.ShoppingCartsModel.fetchById(shoppingCartsCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the shoppingCarts!', error);
        }
    }

    public async update(id: number, data: any): Promise<ShoppingCarts> {
        const shoppingCarts = this.ShoppingCartsModel.forge<ShoppingCarts>({ id });
        try {
            const shoppingCartsUpdated = await shoppingCarts.save(data, { patch: true });
            return this.ShoppingCartsModel.fetchById(shoppingCartsUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the shoppingCarts!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let shoppingCarts = this.ShoppingCartsModel.forge<ShoppingCarts>({ id });
        try {
            shoppingCarts = await shoppingCarts.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await shoppingCarts.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the shoppingCarts!', error);
        }
    }

}
