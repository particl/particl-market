import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../../services/BidService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/BidSearchParams';

export class BidSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'findbids';
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
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            status: data.params[0],
            listingItemId: data.params[1],
            profileId: data.params[2]
        } as BidSearchParams);
    }

    public help(): string {
        return 'BidSearchCommand: TODO: Fill in help string.';
    }
}
