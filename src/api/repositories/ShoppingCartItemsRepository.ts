import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ShoppingCartItems } from '../models/ShoppingCartItems';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShoppingCartItemsRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ShoppingCartItems) public ShoppingCartItemsModel: typeof ShoppingCartItems,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCartItems>> {
        const list = await this.ShoppingCartItemsModel.fetchAll();
        return list as Bookshelf.Collection<ShoppingCartItems>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCartItems> {
        return this.ShoppingCartItemsModel.fetchById(id, withRelated);
    }

    public async findOneByListingItemOnCart(cartId: number, listingItemId: number): Promise<ShoppingCartItems> {
        return this.ShoppingCartItemsModel.findOneByListingItemOnCart(cartId, listingItemId);
    }

    public async create(data: any): Promise<ShoppingCartItems> {
        const shoppingCartItems = this.ShoppingCartItemsModel.forge<ShoppingCartItems>(data);
        try {
            const shoppingCartItemsCreated = await shoppingCartItems.save();
            return this.ShoppingCartItemsModel.fetchById(shoppingCartItemsCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the shoppingCartItems!', error);
        }
    }

    public async update(id: number, data: any): Promise<ShoppingCartItems> {
        const shoppingCartItems = this.ShoppingCartItemsModel.forge<ShoppingCartItems>({ id });
        try {
            const shoppingCartItemsUpdated = await shoppingCartItems.save(data, { patch: true });
            return this.ShoppingCartItemsModel.fetchById(shoppingCartItemsUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the shoppingCartItems!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let shoppingCartItems = this.ShoppingCartItemsModel.forge<ShoppingCartItems>({ id });
        try {
            shoppingCartItems = await shoppingCartItems.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await shoppingCartItems.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the shoppingCartItems!', error);
        }
    }

}
