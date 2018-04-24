import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemActionService } from '../../services/ListingItemActionService';
export declare class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {
    Logger: typeof LoggerType;
    listingItemActionService: ListingItemActionService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemActionService: ListingItemActionService);
    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    execute(data: RpcRequest): Promise<SmsgSendResponse>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
