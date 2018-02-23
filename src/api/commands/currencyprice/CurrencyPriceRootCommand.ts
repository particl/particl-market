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
import { CurrencyPriceService } from '../../services/CurrencyPriceService';
import { MessageException } from '../../exceptions/MessageException';
import { CurrencyPrice } from '../../models/CurrencyPrice';

export class CurrencyPriceRootCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<CurrencyPrice>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CurrencyPriceService) private currencyPriceService: CurrencyPriceService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.CURRENCYPRICE_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: fromCurrency
     * [1]: toCurrency
     * [...]: toCurrency
     *
     * description: fromCurrency must be PART for now and toCurrency may be multiple currencies like INR, USD etc..
     * example: [PART, INR, USD, EUR, GBP, ....]
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<CurrencyPrice>>}
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<CurrencyPrice>> {
        const fromCurrency = data.params.shift();
        // throw exception if fromCurrency is not a PART or toCurrencies has length 0
        if (fromCurrency !== 'PART' || data.params.length < 1 ) {
           throw new MessageException('Invalid params');
        } else {
           // return the currency prices
           return await this.currencyPriceService.getCurrencyPrices(fromCurrency, data.params);
        }
    }

    public help(): string {
        return this.getName() + ' <from> <to> [to...]) \n'
            + '    <from>                   - String - Currency name from which you want to convert. \n'
            + '    <to>                     - String - Currency name in which you want to convert. ';
    }

    public description(): string {
        return 'Command to convert currencies.';
    }
}
