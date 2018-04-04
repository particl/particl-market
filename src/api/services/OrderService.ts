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


export class OrderService {

    public log: LoggerType;

    constructor(
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
    public async create( @request(OrderCreateRequest) body: OrderCreateRequest): Promise<Order> {

        // TODO: extract and remove related models from request
        // const orderRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the order
        const order = await this.orderRepo.create(body);

        // TODO: create related models
        // orderRelated._id = order.Id;
        // await this.orderRelatedService.create(orderRelated);

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
        await this.orderRepo.destroy(id);
    }

}
