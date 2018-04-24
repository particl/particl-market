import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemActionService } from '../../services/ListingItemActionService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemUpdateCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {
    Logger: typeof LoggerType;
    listingItemActionService: ListingItemActionService;
    log: LoggerType;
    name: string;
    constructor(Logger: typeof LoggerType, listingItemActionService: ListingItemActionService);
    /**
     * data.params[]:
     *  [0]: listingitem hash to update
     *  [1]: listingitemtemplate id to update the listingitem with
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    execute(data: RpcRequest): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
