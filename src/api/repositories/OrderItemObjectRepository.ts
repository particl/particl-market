import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { OrderItemObject } from '../models/OrderItemObject';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class OrderItemObjectRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.OrderItemObject) public OrderItemObjectModel: typeof OrderItemObject,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<OrderItemObject>> {
        const list = await this.OrderItemObjectModel.fetchAll();
        return list as Bookshelf.Collection<OrderItemObject>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<OrderItemObject> {
        return this.OrderItemObjectModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<OrderItemObject> {
        const orderItemObject = this.OrderItemObjectModel.forge<OrderItemObject>(data);
        try {
            const orderItemObjectCreated = await orderItemObject.save();
            return this.OrderItemObjectModel.fetchById(orderItemObjectCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the orderItemObject!', error);
        }
    }

    public async update(id: number, data: any): Promise<OrderItemObject> {
        const orderItemObject = this.OrderItemObjectModel.forge<OrderItemObject>({ id });
        try {
            const orderItemObjectUpdated = await orderItemObject.save(data, { patch: true });
            return this.OrderItemObjectModel.fetchById(orderItemObjectUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the orderItemObject!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let orderItemObject = this.OrderItemObjectModel.forge<OrderItemObject>({ id });
        try {
            orderItemObject = await orderItemObject.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await orderItemObject.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the orderItemObject!', error);
        }
    }

}
