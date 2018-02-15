import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';

import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

import { PriceTickerService } from '../../services/PriceTickerService';
import { MessageException } from '../../exceptions/MessageException';
import { PriceTicker } from '../../models/PriceTicker';


export class PriceTickerRootCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<PriceTicker>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.PriceTickerService) private priceTickerService: PriceTickerService
    ) {
        super(Commands.PRICETICKER_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     * [0] currecny
     *  .
     * [n] currency
     *
     * example: [ETH, BTC, XRP]
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<PriceTicker>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<PriceTicker>> {
        if (data.params.length > 0) {
            let returnData: any = [];
            returnData = await this.priceTickerService.getPriceTickers(data.params);
            return returnData;
        } else {
            throw new MessageException('Currency can\'t be blank');
        }
    }

    public help(): string {
        return this.getName() + '<currency> [currencies...]\n'
            + '    <currency>    - currency\n';
    }

    public description(): string {
        return 'Commands for managing PriceTicker.';
    }
}
