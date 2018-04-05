import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { OrderRepository } from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
import { OrderUpdateRequest } from '../requests/OrderUpdateRequest';
import { HashableObjectType } from '../enums/HashableObjectType';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { MessageException } from '../exceptions/MessageException';
import { OrderItemService } from './OrderItemService';
import { AddressService } from './AddressService';
import {AddressType} from '../enums/AddressType';


export class OrderService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) public orderItemService: OrderItemService,
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

    @validate()
    public async create( @request(OrderCreateRequest) data: OrderCreateRequest): Promise<Order> {

        const body = JSON.parse(JSON.stringify(data));

        // you need at least one order item to create an order
        body.hash = ObjectHash.getHash(body, HashableObjectType.ORDER_CREATEREQUEST);

        const orderItemCreateRequests = body.orderItems;
        delete body.orderItems;
        const addressCreateRequest = body.address;
        delete body.address;

        // make sure we have at least one orderItem
        if (_.isEmpty(orderItemCreateRequests)) {
            this.log.error('Order does not contain orderItems.');
            throw new MessageException('Order does not contain orderItems.');
        }

        // shipping address
        if (_.isEmpty(addressCreateRequest)) {
            this.log.error('Request body is not valid, address missing');
            throw new MessageException('Order does not contain ShippingAddress');
        }

        // make sure the Orders shipping address has the correct type
        addressCreateRequest.type = AddressType.SHIPPING_ORDER;

        // save shipping address
        const addressModel = await this.addressService.create(addressCreateRequest);
        const address = addressModel.toJSON();

        this.log.debug('created address: ', JSON.stringify(address, null, 2));

        // set the address_id for order
        body.address_id = address.id;

        // this.log.debug('create Order, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the order
        const orderModel = await this.orderRepo.create(body);
        const order = orderModel.toJSON();

        this.log.debug('created order: ', JSON.stringify(order, null, 2));

        // then create the OrderItems
        for (const orderItemCreateRequest of orderItemCreateRequests) {
            orderItemCreateRequest.order_id = order.id;
            await this.orderItemService.create(orderItemCreateRequest);
        }

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

        // const newOrder = await this.findOne(id);
        // return newOrder;

        return updatedOrder;
    }

    public async destroy(id: number): Promise<void> {

        const orderModel = await this.findOne(id);
        const order = orderModel.toJSON();

        // first remove the related address
        await this.addressService.destroy(order.ShippingAddress.id);

        // then remove the OrderItems
        for (const orderItem of order.OrderItems) {
            await this.orderItemService.destroy(orderItem.id);
        }

        this.log.debug('removing order:', id);
        await this.orderRepo.destroy(id);
    }

}
