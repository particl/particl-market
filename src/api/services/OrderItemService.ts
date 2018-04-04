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
    public async create( @request(OrderItemCreateRequest) body: OrderItemCreateRequest): Promise<OrderItem> {

        // TODO: extract and remove related models from request
        // const orderItemRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the orderItem
        const orderItem = await this.orderItemRepo.create(body);

        // TODO: create related models
        // orderItemRelated._id = orderItem.Id;
        // await this.orderItemRelatedService.create(orderItemRelated);

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
