import { Logger as LoggerType } from '../../../core/Logger';
import { ItemLocationService } from '../../services/ItemLocationService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ItemLocationRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    itemLocationService: ItemLocationService;
    listingItemTemplateService: ListingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, itemLocationService: ItemLocationService, listingItemTemplateService: ListingItemTemplateService);
    /**
     *
     * data.params[]:
     * [0]: listingItemTemplateId
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    private getItemInformation(data);
}
