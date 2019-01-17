// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ShoppingCartItem } from '../models/ShoppingCartItem';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShoppingCartItemRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ShoppingCartItem) public ShoppingCartItemModel: typeof ShoppingCartItem,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        const list = await this.ShoppingCartItemModel.fetchAll();
        return list as Bookshelf.Collection<ShoppingCartItem>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        return this.ShoppingCartItemModel.fetchById(id, withRelated);
    }

    public async findOneByCartIdAndListingItemId(cartId: number, listingItemId: number): Promise<ShoppingCartItem> {
        return this.ShoppingCartItemModel.fetchByCartIdAndListingItemId(cartId, listingItemId);
    }

    public async findAllByCartId(cartId: number): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return this.ShoppingCartItemModel.fetchAllByCartId(cartId);
    }

    public async create(data: any): Promise<ShoppingCartItem> {
        const shoppingCartItem = this.ShoppingCartItemModel.forge<ShoppingCartItem>(data);
        try {
            const shoppingCartItemCreated = await shoppingCartItem.save();
            return this.ShoppingCartItemModel.fetchById(shoppingCartItemCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the shoppingCartItem!', error);
        }
    }

    public async update(id: number, data: any): Promise<ShoppingCartItem> {
        const shoppingCartItem = this.ShoppingCartItemModel.forge<ShoppingCartItem>({ id });
        try {
            const shoppingCartItemUpdated = await shoppingCartItem.save(data, { patch: true });
            return this.ShoppingCartItemModel.fetchById(shoppingCartItemUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the shoppingCartItem!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let shoppingCartItem = this.ShoppingCartItemModel.forge<ShoppingCartItem>({ id });
        try {
            shoppingCartItem = await shoppingCartItem.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await shoppingCartItem.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the shoppingCartItem!', error);
        }
    }

    public async clearCart(cartId: number): Promise<void> {
        return this.ShoppingCartItemModel.clearCart(cartId);
    }

}
