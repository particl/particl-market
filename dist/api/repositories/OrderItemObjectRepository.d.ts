import * as Bookshelf from 'bookshelf';
import { OrderItemObject } from '../models/OrderItemObject';
import { Logger as LoggerType } from '../../core/Logger';
export declare class OrderItemObjectRepository {
    OrderItemObjectModel: typeof OrderItemObject;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(OrderItemObjectModel: typeof OrderItemObject, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<OrderItemObject>>;
    findOne(id: number, withRelated?: boolean): Promise<OrderItemObject>;
    create(data: any): Promise<OrderItemObject>;
    update(id: number, data: any): Promise<OrderItemObject>;
    destroy(id: number): Promise<void>;
}
