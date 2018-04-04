import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { OrderItemObjectRepository } from '../repositories/OrderItemObjectRepository';
import { OrderItemObject } from '../models/OrderItemObject';
import { OrderItemObjectCreateRequest } from '../requests/OrderItemObjectCreateRequest';
import { OrderItemObjectUpdateRequest } from '../requests/OrderItemObjectUpdateRequest';


export class OrderItemObjectService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.OrderItemObjectRepository) public orderItemObjectRepo: OrderItemObjectRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<OrderItemObject>> {
        return this.orderItemObjectRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<OrderItemObject> {
        const orderItemObject = await this.orderItemObjectRepo.findOne(id, withRelated);
        if (orderItemObject === null) {
            this.log.warn(`OrderItemObject with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return orderItemObject;
    }

    @validate()
    public async create( @request(OrderItemObjectCreateRequest) body: OrderItemObjectCreateRequest): Promise<OrderItemObject> {

        // TODO: extract and remove related models from request
        // const orderItemObjectRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the orderItemObject
        const orderItemObject = await this.orderItemObjectRepo.create(body);

        // TODO: create related models
        // orderItemObjectRelated._id = orderItemObject.Id;
        // await this.orderItemObjectRelatedService.create(orderItemObjectRelated);

        // finally find and return the created orderItemObject
        const newOrderItemObject = await this.findOne(orderItemObject.id);
        return newOrderItemObject;
    }

    @validate()
    public async update(id: number, @request(OrderItemObjectUpdateRequest) body: OrderItemObjectUpdateRequest): Promise<OrderItemObject> {

        // find the existing one without related
        const orderItemObject = await this.findOne(id, false);

        // set new values
        orderItemObject.DataId = body.dataId;
        orderItemObject.DataValue = body.dataValue;

        // update orderItemObject record
        const updatedOrderItemObject = await this.orderItemObjectRepo.update(id, orderItemObject.toJSON());

        // const newOrderItemObject = await this.findOne(id);
        // return newOrderItemObject;

        return updatedOrderItemObject;
    }

    public async destroy(id: number): Promise<void> {
        await this.orderItemObjectRepo.destroy(id);
    }

}
