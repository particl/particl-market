import * as Bookshelf from 'bookshelf';
import { ShippingDestination } from '../models/ShippingDestination';
import { Logger as LoggerType } from '../../core/Logger';
import { ShippingDestinationSearchParams } from '../requests/ShippingDestinationSearchParams';
export declare class ShippingDestinationRepository {
    ShippingDestinationModel: typeof ShippingDestination;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ShippingDestinationModel: typeof ShippingDestination, Logger: typeof LoggerType);
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
    create(data: any): Promise<ShippingDestination>;
    update(id: number, data: any): Promise<ShippingDestination>;
    destroy(id: number): Promise<void>;
}
