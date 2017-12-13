import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MarketService } from '../MarketService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';

export class RpcMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: private_key
     *  [2]: address
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<Market> {
        return this.marketService.create({
            name : data.params[0],
            private_key : data.params[1],
            address : data.params[2]
        });
    }
}
