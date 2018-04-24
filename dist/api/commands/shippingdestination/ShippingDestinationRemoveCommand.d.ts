import { Logger as LoggerType } from '../../../core/Logger';
import { ShippingDestinationService } from '../../services/ShippingDestinationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ShippingDestinationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private shippingDestinationService;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, shippingDestinationService: ShippingDestinationService, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: shippingDestinationId
     * or
     * TODO: this seems unnecessary, in what situation would we need this?
     *  [0]: listing_item_template_id
     *  [1]: country/countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    /**
     * TODO: NOTE: This function may be duplicated between commands.
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: countryCode
     *  [2]: shipping availability (ShippingAvailability enum)
     *
     */
    private searchShippingDestination(listingItemTemplateId, countryCode, shippingAvail);
}
