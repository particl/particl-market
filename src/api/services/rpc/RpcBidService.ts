import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../BidService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { BidSearchParams } from '../../requests/BidSearchParams';

export class RpcBidService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: status, string
     * [1]: listingItemId, number
     * [2]: profileId, number
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async search( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            status: data.params[0],
            listingItemId: data.params[1],
            profileId: data.params[2]
        } as BidSearchParams);
    }
}
