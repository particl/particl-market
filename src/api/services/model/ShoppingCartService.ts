// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ShoppingCartRepository } from '../../repositories/ShoppingCartRepository';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartCreateRequest } from '../../requests/model/ShoppingCartCreateRequest';
import { ShoppingCartUpdateRequest } from '../../requests/model/ShoppingCartUpdateRequest';

export class ShoppingCartService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShoppingCartRepository) public shoppingCartRepo: ShoppingCartRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShoppingCart>> {
        return this.shoppingCartRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = false): Promise<Bookshelf.Collection<ShoppingCart>> {
        return await this.shoppingCartRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShoppingCart> {
        const shoppingCart = await this.shoppingCartRepo.findOne(id, withRelated);
        if (shoppingCart === null) {
            this.log.warn(`ShoppingCart with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shoppingCart;
    }

    @validate()
    public async create( @request(ShoppingCartCreateRequest) body: any): Promise<ShoppingCart> {
        const shoppingCart = await this.shoppingCartRepo.create(body);
        return await this.findOne(shoppingCart.id);
    }

    @validate()
    public async update(id: number, @request(ShoppingCartUpdateRequest) body: any): Promise<ShoppingCart> {

        const shoppingCart = await this.findOne(id, false);
        shoppingCart.Name = body.name;

        return await this.shoppingCartRepo.update(id, shoppingCart.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.shoppingCartRepo.destroy(id);
    }

}
