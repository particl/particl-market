import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { OrderRepository } from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
import { OrderUpdateRequest } from '../requests/OrderUpdateRequest';
import { OrderSearchParams } from '../requests/OrderSearchParams';
import { OrderItemService } from './OrderItemService';
import { AddressService } from './AddressService';
import { ListingItemService } from './ListingItemService';
export declare class OrderService {
    addressService: AddressService;
    listingItemService: ListingItemService;
    orderItemService: OrderItemService;
    orderRepo: OrderRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(addressService: AddressService, listingItemService: ListingItemService, orderItemService: OrderItemService, orderRepo: OrderRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Order>>;
    findOne(id: number, withRelated?: boolean): Promise<Order>;
    /**
     * search Order using given OrderSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options: OrderSearchParams, withRelated?: boolean): Promise<Bookshelf.Collection<Order>>;
    create(data: OrderCreateRequest): Promise<Order>;
    update(id: number, body: OrderUpdateRequest): Promise<Order>;
    destroy(id: number): Promise<void>;
}
