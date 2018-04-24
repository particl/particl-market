import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { OrderItemObjectRepository } from '../repositories/OrderItemObjectRepository';
import { OrderItemObject } from '../models/OrderItemObject';
import { OrderItemObjectCreateRequest } from '../requests/OrderItemObjectCreateRequest';
import { OrderItemObjectUpdateRequest } from '../requests/OrderItemObjectUpdateRequest';
export declare class OrderItemObjectService {
    orderItemObjectRepo: OrderItemObjectRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(orderItemObjectRepo: OrderItemObjectRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<OrderItemObject>>;
    findOne(id: number, withRelated?: boolean): Promise<OrderItemObject>;
    create(data: OrderItemObjectCreateRequest): Promise<OrderItemObject>;
    update(id: number, body: OrderItemObjectUpdateRequest): Promise<OrderItemObject>;
    destroy(id: number): Promise<void>;
}
