import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ShippingDestinationRepository } from '../repositories/ShippingDestinationRepository';
import { ShippingDestination } from '../models/ShippingDestination';
import { ShippingDestinationCreateRequest } from '../requests/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../requests/ShippingDestinationUpdateRequest';
import { ShippingDestinationSearchParams } from '../requests/ShippingDestinationSearchParams';
export declare class ShippingDestinationService {
    shippingDestinationRepo: ShippingDestinationRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(shippingDestinationRepo: ShippingDestinationRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ShippingDestination>>;
    findOne(id: number, withRelated?: boolean): Promise<ShippingDestination>;
    /**
     * options:
     *  item_information_id: options.item_information_id
     *  country: options.options
     *  shipping_availability: options.shipping_availability
     *
     * @param options
     * @returns {Promise<ShippingDestination>}
     */
    search(options: ShippingDestinationSearchParams): Promise<ShippingDestination>;
    create(body: ShippingDestinationCreateRequest): Promise<ShippingDestination>;
    update(id: number, body: ShippingDestinationUpdateRequest): Promise<ShippingDestination>;
    destroy(id: number): Promise<void>;
}
