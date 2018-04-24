import * as Bookshelf from 'bookshelf';
import { Order } from '../models/Order';
import { Logger as LoggerType } from '../../core/Logger';
import { OrderSearchParams } from '../requests/OrderSearchParams';
export declare class OrderRepository {
    OrderModel: typeof Order;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(OrderModel: typeof Order, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Order>>;
    findOne(id: number, withRelated?: boolean): Promise<Order>;
    /**
     *
     * @param options, OrderSearchParams
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    search(options: OrderSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<Order>>;
    create(data: any): Promise<Order>;
    update(id: number, data: any): Promise<Order>;
    destroy(id: number): Promise<void>;
}
