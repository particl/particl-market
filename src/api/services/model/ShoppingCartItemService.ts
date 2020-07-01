// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { ShoppingCartItemRepository } from '../../repositories/ShoppingCartItemRepository';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemCreateRequest } from '../../requests/model/ShoppingCartItemCreateRequest';
import { ShoppingCartItemUpdateRequest } from '../../requests/model/ShoppingCartItemUpdateRequest';

export class ShoppingCartItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartItemRepository) public shoppingCartItemRepo: ShoppingCartItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return this.shoppingCartItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCartItem> {
        const shoppingCartItem = await this.shoppingCartItemRepo.findOne(id, withRelated);
        if (shoppingCartItem === null) {
            this.log.warn(`ShoppingCartItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCartItem;
    }

    public async findOneByCartIdAndListingItemId(cartId: number, listingItemId: number): Promise<ShoppingCartItem> {
        const shoppingCartItem = await this.shoppingCartItemRepo.findOneByCartIdAndListingItemId(cartId, listingItemId);
        if (shoppingCartItem === null) {
            this.log.warn(`ShoppingCartItem in the cart=${cartId} with the id=${listingItemId} was not found!`);
            throw new NotFoundException(cartId + '/' + listingItemId);
        }
        return shoppingCartItem;
    }

    public async findAllByCartId(cartId: number): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return await this.shoppingCartItemRepo.findAllByCartId(cartId);
    }

    public async findAllByListingItem(listingItemId: number): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return await this.shoppingCartItemRepo.findAllByListingItem(listingItemId);
    }

    @validate()
    public async create( @request(ShoppingCartItemCreateRequest) body: any): Promise<ShoppingCartItem> {
        const shoppingCartItem: resources.ShoppingCartItem = await this.shoppingCartItemRepo.create(body).then(value => value.toJSON());
        return await this.findOne(shoppingCartItem.id);
    }

    @validate()
    public async update(id: number, @request(ShoppingCartItemUpdateRequest) body: any): Promise<ShoppingCartItem> {
        const shoppingCartItem = await this.findOne(id, false);
        return await this.shoppingCartItemRepo.update(id, shoppingCartItem.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartItemRepo.destroy(id);
    }

    public async destroyByCartId(cartId: number): Promise<void> {
        await this.shoppingCartItemRepo.destroyByCartId(cartId);
    }

}
