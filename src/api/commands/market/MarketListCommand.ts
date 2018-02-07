import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketService } from '../../services/MarketService';

/*
 * Get a list of all markets
 */
export class MarketListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Market>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService

    ) {
        super(Commands.MARKET_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * @param data
     * @returns {Promise<Bookshelf.Collection<Market>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Market>> {
        return this.marketService.findAll();
    }

    public help(): string {
        return this.getName();
    }

    public description(): string {
        return 'List all the markets.';
    }
}
