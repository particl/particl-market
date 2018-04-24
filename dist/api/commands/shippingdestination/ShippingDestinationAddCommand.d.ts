import { Logger as LoggerType } from '../../../core/Logger';
import { ShippingDestinationService } from '../../services/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ShippingDestinationAddCommand extends BaseCommand implements RpcCommandInterface<ShippingDestination> {
    Logger: typeof LoggerType;
    private shippingDestinationService;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, shippingDestinationService: ShippingDestinationService, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * If countryCode is country, convert to countryCode.
     * If countryCode is country code, validate, and possibly throw error.
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data: RpcRequest): Promise<ShippingDestination>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    private validateShippingAvailability(shippingAvailStr);
}
