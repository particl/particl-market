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

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        if (data.params.length > 0) {
            const currencies = data.params;
            let returnData: any = [];
            for (const currency of currencies) { // INR, USD
                let searchData: any = await this.priceTickerService.search(currency);
                let priceTicker: any = [];
                searchData = searchData.toJSON();
                if (searchData.length > 0) {
                    // check and update first record only
                    const needToBeUpdate = await this.priceTickerService.needTobeUpdate(searchData[0]);
                    priceTicker = searchData;
                    if (needToBeUpdate) {
                        priceTicker = await this.priceTickerService.updatePriceTicker(searchData, currency);
                    }
                } else {
                    // call api and create
                    priceTicker = await this.priceTickerService.getAndCreateData(currency);
                }
                returnData = returnData.concat(priceTicker);
            }
            return returnData;
        } else {
            throw new MessageException('Currency can\'t be blank');
        }
    }

    public help(): string {
        return this.getName();
    }

    public description(): string {
        return 'Commands for managing PriceTicker.';
    }
}
