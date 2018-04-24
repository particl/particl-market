import * as Bookshelf from 'bookshelf';
import { OrderItem } from '../models/OrderItem';
import { Logger as LoggerType } from '../../core/Logger';
export declare class OrderItemRepository {
    OrderItemModel: typeof OrderItem;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(OrderItemModel: typeof OrderItem, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<OrderItem>>;
    findOne(id: number, withRelated?: boolean): Promise<OrderItem>;
    create(data: any): Promise<OrderItem>;
    update(id: number, data: any): Promise<OrderItem>;
    destroy(id: number): Promise<void>;
}
