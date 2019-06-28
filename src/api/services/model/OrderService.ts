// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { OrderRepository } from '../../repositories/OrderRepository';
import { Order } from '../../models/Order';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { OrderUpdateRequest } from '../../requests/model/OrderUpdateRequest';
import { OrderSearchParams } from '../../requests/search/OrderSearchParams';
import { OrderItemService } from './OrderItemService';
import { AddressService } from './AddressService';
import { ListingItemService } from './ListingItemService';
import { ProfileService } from './ProfileService';
import { OrderStatus } from '../../enums/OrderStatus';
import * as resources from 'resources';

export class OrderService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Repository) @named(Targets.Repository.OrderRepository) public orderRepo: OrderRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Order>> {
        return this.orderRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Order> {
        const order = await this.orderRepo.findOne(id, withRelated);
        if (order === null) {
            this.log.warn(`Order with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return order;
    }

    /**
     * searchBy Order using given OrderSearchParams
     *
     * @param options
     * @param withRelated
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async search(@request(OrderSearchParams) options: OrderSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Order>> {

        // if item hash was given, set the item id
        if (options.listingItemHash) {
            const foundListing = await this.listingItemService.findOneByHash(options.listingItemHash, false);
            options.listingItemId = foundListing.Id;
        }
        return await this.orderRepo.search(options, withRelated);
    }

    @validate()
    public async create( @request(OrderCreateRequest) data: OrderCreateRequest): Promise<Order> {
        const startTime = new Date().getTime();

        const body: OrderCreateRequest = JSON.parse(JSON.stringify(data));
        // this.log.debug('OrderCreateRequest: ', JSON.stringify(body, null, 2));

        const orderItemCreateRequests = body.orderItems || [];
        delete body.orderItems;

        // this.log.debug('OrderCreateRequest body:', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the order
        const order: resources.Order = await this.orderRepo.create(body).then(value => value.toJSON());

        // this.log.debug('created order: ', JSON.stringify(order, null, 2));
        // this.log.debug('orderItemCreateRequests: ', JSON.stringify(orderItemCreateRequests, null, 2));

        // then create the OrderItems
        for (const orderItemCreateRequest of orderItemCreateRequests) {
            orderItemCreateRequest.order_id = order.id;
            const orderItemModel = await this.orderItemService.create(orderItemCreateRequest);
            const orderItem = orderItemModel.toJSON();
            // this.log.debug('created orderItem: ', JSON.stringify(orderItem, null, 2));
        }

        this.log.debug('orderService.create: ' + (new Date().getTime() - startTime) + 'ms');

        // finally find and return the created order
        const newOrder = await this.findOne(order.id);
        return newOrder;
    }

    @validate()
    public async update(id: number, @request(OrderUpdateRequest) body: OrderUpdateRequest): Promise<Order> {

        // find the existing one without related
        const order = await this.findOne(id, false);

        // set new values
        order.Hash = body.hash;
        order.Buyer = body.buyer;
        order.Seller = body.seller;

        // update order record
        const updatedOrder = await this.orderRepo.update(id, order.toJSON());
        return updatedOrder;
    }

    public async destroy(id: number): Promise<void> {

        const order: resources.Order = await this.findOne(id).then(value => value.toJSON());

        // then remove the OrderItems
        for (const orderItem of order.OrderItems) {
            await this.orderItemService.destroy(orderItem.id);
        }

        this.log.debug('removing order:', id);
        await this.orderRepo.destroy(id);
    }

    public async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id, false);
        order.Status = status;
        const updated = await this.orderRepo.update(id, order.toJSON());
        this.log.debug('updated Order ' + id + ' status to: ' + updated.Status);
        return updated;

    }

}
