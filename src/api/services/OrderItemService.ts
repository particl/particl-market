import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { OrderItemRepository } from '../repositories/OrderItemRepository';
import { OrderItem } from '../models/OrderItem';
import { OrderItemCreateRequest } from '../requests/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../requests/OrderItemUpdateRequest';
import { OrderItemObjectService } from './OrderItemObjectService';


export class OrderItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.OrderItemObjectService) public orderItemObjectService: OrderItemObjectService,
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

        const body = JSON.parse(JSON.stringify(data));

        const orderItemObjects = body.orderItemObjects;
        delete body.orderItemObjects;

        // this.log.debug('create OrderItem, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the orderItem
        const orderItemModel = await this.orderItemRepo.create(body);
        const orderItem = orderItemModel.toJSON();

        this.log.debug('created orderItem: ', JSON.stringify(orderItem, null, 2));

        for (const orderItemObject of orderItemObjects) {
            orderItemObject.order_item_id = orderItem.id;
            // stringify unless string
            orderItemObject.dataValue = typeof (orderItemObject.dataValue) === 'string' ? orderItemObject.dataValue : JSON.stringify(orderItemObject.dataValue);
            await this.orderItemObjectService.create(orderItemObject);
        }

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

        const orderItemModel = await this.findOne(id);
        const orderItem = orderItemModel.toJSON();

        // then remove the OrderItemObjects
        for (const orderItemObject of orderItem.OrderItemObjects) {
            await this.orderItemObjectService.destroy(orderItemObject.id);
        }

        this.log.debug('removing orderItem:', id);
        await this.orderItemRepo.destroy(id);
    }

}
