// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { OrderItemRepository } from '../../repositories/OrderItemRepository';
import { OrderItem } from '../../models/OrderItem';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../../requests/model/OrderItemUpdateRequest';

export class OrderItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.OrderItemRepository) public orderItemRepo: OrderItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<OrderItem>> {
        return this.orderItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<OrderItem> {
        const orderItem = await this.orderItemRepo.findOne(id, withRelated);
        if (orderItem === null) {
            this.log.warn(`OrderItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return orderItem;
    }

    @validate()
    public async create( @request(OrderItemCreateRequest) data: OrderItemCreateRequest): Promise<OrderItem> {

        const body: OrderItemCreateRequest = JSON.parse(JSON.stringify(data));
        // this.log.debug('OrderItemCreateRequest: ', JSON.stringify(body, null, 2));

        // this.log.debug('create OrderItem, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the orderItem
        const orderItem: resources.Order = await this.orderItemRepo.create(body).then(value => value.toJSON());

        // this.log.debug('created orderItem: ', JSON.stringify(orderItem, null, 2));

        // finally find and return the created orderItem
        const newOrderItem = await this.findOne(orderItem.id);
        return newOrderItem;
    }

    @validate()
    public async update(id: number, @request(OrderItemUpdateRequest) body: OrderItemUpdateRequest): Promise<OrderItem> {

        // find the existing one without related
        const orderItem = await this.findOne(id, false);

        // set new values
        orderItem.Status = body.status;

        // update orderItem record
        const updatedOrderItem = await this.orderItemRepo.update(id, orderItem.toJSON());

        // const newOrderItem = await this.findOne(id);
        // return newOrderItem;

        return updatedOrderItem;
    }

    public async destroy(id: number): Promise<void> {
        await this.orderItemRepo.destroy(id);
    }

}
