import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemTemplateRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    listingItemTemplateService: ListingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
