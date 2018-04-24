import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemTemplateAddCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: short description
     *  [3]: long description
     *  [4]: category id
     *
     *  paymentInformation
     *  [5]: payment type
     *  [6]: currency
     *  [7]: base price
     *  [8]: domestic shipping price
     *  [9]: international shipping price
     *  [10]: payment address (optional)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data: RpcRequest): Promise<ListingItemTemplate>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
