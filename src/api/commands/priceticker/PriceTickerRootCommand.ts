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


export class PriceTickerRootCommand extends BaseCommand implements RpcCommandInterface<void> {

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
     * currencies[]: array of currencies
     * example: [INR, USD, EUR, GBP]
     *
     * description: Array of currency like.. [INR, USD, EUR, GBP].
     * ...
     */

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        if (data.params.length > 0) {
            const returnData = await this.priceTickerService.executePriceTicker(data.params);
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
