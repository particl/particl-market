import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MarketService } from '../services/MarketService';
import { RpcRequest } from '../requests/RpcRequest';
import { Market } from '../models/Market';
import {RpcCommand} from './RpcCommand';

export class AddMarketCommand implements RpcCommand<Market> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'addmarket';
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
    public async execute( @request(RpcRequest) data: any): Promise<Market> {
        return this.marketService.create({
            name : data.params[0],
            private_key : data.params[1],
            address : data.params[2]
        });
    }

    public help(): string {
        return 'AddMarketCommand: TODO: Fill in help string.';
    }
}
