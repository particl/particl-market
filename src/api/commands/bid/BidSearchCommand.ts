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
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class BidSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService
    ) {
        super(Commands.BID_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * TODO: Update to match help().
     *
     * data.params[]:
     * [0]: itemhash, string?
     * [1]: status, string?
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            listingItemHash: data.params[0],
            action: data.params[1]
        } as BidSearchParams);
    }

    /*@validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            action: data.params[0],
            listingItemId: data.params[1],
            profileId: data.params[2]
        } as BidSearchParams);
    }*/

    public help(): string {
        return this.getName() + ' <itemhash> [<status>]\n'
            + '    <itemhash>  - [TODO] - [TODO]\n'
            + '    <status>    - [optional] [TODO] - [TODO]';
    }

    public description(): string {
            return 'Search bids.';
    }
}
