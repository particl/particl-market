import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ListingItemTemplateGetCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService);
    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
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
