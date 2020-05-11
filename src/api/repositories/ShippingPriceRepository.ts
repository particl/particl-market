// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ShippingPrice } from '../models/ShippingPrice';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ShippingPriceRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ShippingPrice) public ShippingPriceModel: typeof ShippingPrice,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShippingPrice>> {
        const list = await this.ShippingPriceModel.fetchAll();
        return list as Bookshelf.Collection<ShippingPrice>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShippingPrice> {
        return this.ShippingPriceModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ShippingPrice> {
        const shippingPrice = this.ShippingPriceModel.forge<ShippingPrice>(data);
        try {
            const shippingPriceCreated = await shippingPrice.save();
            return this.ShippingPriceModel.fetchById(shippingPriceCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the shippingPrice!', error);
        }
    }

    public async update(id: number, data: any): Promise<ShippingPrice> {
        const shippingPrice = this.ShippingPriceModel.forge<ShippingPrice>({ id });
        try {
            const shippingPriceUpdated = await shippingPrice.save(data, { patch: true });
            return this.ShippingPriceModel.fetchById(shippingPriceUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the shippingPrice!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let shippingPrice = this.ShippingPriceModel.forge<ShippingPrice>({ id });
        try {
            shippingPrice = await shippingPrice.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await shippingPrice.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the shippingPrice!', error);
        }
    }

}
