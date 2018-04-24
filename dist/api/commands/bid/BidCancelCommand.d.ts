import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemService } from '../../services/ListingItemService';
import { BaseCommand } from '../BaseCommand';
import { BidActionService } from '../../services/BidActionService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
export declare class BidCancelCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {
    Logger: typeof LoggerType;
    private listingItemService;
    private bidActionService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemService: ListingItemService, bidActionService: BidActionService);
    /**
     * data.params[]:
     * [0]: itemhash, string
     * [1]: bidId
     *
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    execute(data: RpcRequest): Promise<SmsgSendResponse>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
