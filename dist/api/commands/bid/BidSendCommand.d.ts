import { Logger as LoggerType } from '../../../core/Logger';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidActionService } from '../../services/BidActionService';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
export declare class BidSendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {
    Logger: typeof LoggerType;
    private listingItemService;
    private addressService;
    private profileService;
    private bidActionService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemService: ListingItemService, addressService: AddressService, profileService: ProfileService, bidActionService: BidActionService);
    /**
     * Posts a Bid to the network
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: profileId, number
     * [1]: addressId (from profile shipping addresses), number
     * [2]: bidDataId, string
     * [3]: bidDataValue, string
     * [4]: bidDataId, string
     * [5]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    execute(data: RpcRequest): Promise<SmsgSendResponse>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
