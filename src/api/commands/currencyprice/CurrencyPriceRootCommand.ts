import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';
import { CurrencyPriceService } from '../../services/CurrencyPriceService';
import { MessageException } from '../../exceptions/MessageException';

export class CurrencyPriceRootCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CurrencyPriceService) private currencyPriceService: CurrencyPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.CURRENCYPRICE_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     * [0]: fromCurrency
     * [1]: toCurrency
     * [...]: toCurrency
     *
     * description: fromCurrency must be PART for now and toCurrency may be multiple currencies like INR, USD etc..
     * example: [PART, INR, USD, EUR, GBP, ....]
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        const fromCurrency = data.params.shift();
        // throw exception if fromCurrency is not a PART or toCurrencies has length 0
        if (fromCurrency !== 'PART' || data.params.length < 1 ) {
           throw new MessageException('Invalid params');
        } else {
           return await this.currencyPriceService.getCurrencyPrices(fromCurrency, data.params);
        }
    }

    public help(): string {
        return this.getName() + '<from>, ,[to...])\n'
            + '    <from>                     - String - The currency name from we want to convert the currency\n'

            + '    <to>                       - Sting[] - Array of currencies name to we want to convert the currency\n';
    }

    public description(): string {
        return 'Commands for managing currency converter.';
    }
}
