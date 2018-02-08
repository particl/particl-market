import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { CurrencyPriceService } from '../../services/CurrencyPriceService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { CurrencyPriceParams } from '../../requests/CurrencyPriceParams';
import { SupportedCurrencies } from '../../enums/SupportedCurrencies';

export class CurrencyPriceAddCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CurrencyPriceService) private currencyPriceService: CurrencyPriceService
    ) {
        super(Commands.CURRENCYPRICE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        if (data.params[0] !== 'PART' || data.params.length < 2 ) {
           throw new MessageException('Invalid params');
        } else {

            const fromCurrency = data.params.shift();
            const unSupportedCurrencies: any = [];
            for (const toCurrency of data.params) {
                // check whether toCurrency is supported
                if (SupportedCurrencies[toCurrency]) {
                    await this.currencyPriceService.convertCurrency({
                        from: fromCurrency,
                        to: toCurrency
                    } as CurrencyPriceParams);
                } else {
                    unSupportedCurrencies.push(toCurrency);
                }
            }

            return unSupportedCurrencies.length ? `Not supported Currencies ${unSupportedCurrencies}` : 'Currency added successfully';
        }
    }

    public help(): string {
        return this.getName() + '[<from>, <to>...])\n'
            + '    <from>                     - String - The currency name from we want to convert the currency\n'

            + '    <to>                        - String - The currency name to we want to convert the currency it may can be multiple\n';
    }

    public description(): string {
        return 'Convert price from one currency to another currency.';
    }
}
