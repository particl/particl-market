import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { OrderItemRepository } from '../repositories/OrderItemRepository';
import { OrderItem } from '../models/OrderItem';
import { OrderItemCreateRequest } from '../requests/OrderItemCreateRequest';
import { OrderItemUpdateRequest } from '../requests/OrderItemUpdateRequest';
import { OrderItemObjectService } from './OrderItemObjectService';
export declare class OrderItemService {
    orderItemObjectService: OrderItemObjectService;
    orderItemRepo: OrderItemRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(orderItemObjectService: OrderItemObjectService, orderItemRepo: OrderItemRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<OrderItem>>;
    findOne(id: number, withRelated?: boolean): Promise<OrderItem>;
    create(data: OrderItemCreateRequest): Promise<OrderItem>;
    update(id: number, body: OrderItemUpdateRequest): Promise<OrderItem>;
    destroy(id: number): Promise<void>;
}
