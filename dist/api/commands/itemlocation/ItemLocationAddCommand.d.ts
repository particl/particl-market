import { Logger as LoggerType } from '../../../core/Logger';
import { ItemLocationService } from '../../services/ItemLocationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemLocation } from '../../models/ItemLocation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { BaseCommand } from '../BaseCommand';
export declare class ItemLocationAddCommand extends BaseCommand implements RpcCommandInterface<ItemLocation> {
    Logger: typeof LoggerType;
    private itemLocationService;
    listingItemTemplateService: ListingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemLocationService: ItemLocationService, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     * [0]: listing_item_template_id
     * [1]: region (country/countryCode)
     * [2]: address
     * [3]: gps marker title
     * [4]: gps marker description
     * [5]: gps marker latitude
     * [6]: gps marker longitude
     *
     * @param data
     * @returns {Promise<ItemLocation>}
     */
    execute(data: RpcRequest): Promise<ItemLocation>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
    private getItemInformation(listingItemTemplateId);
}
