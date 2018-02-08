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
import { PriceTickerCreateRequest } from '../../requests/PriceTickerCreateRequest';
import { PriceTickerUpdateRequest } from '../../requests/PriceTickerUpdateRequest';

import * as Bookshelf from 'bookshelf';
import * as Request from 'request';
import Json from '*.json';

export class PriceTickerFetchCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.PriceTickerService) private priceTickerService: PriceTickerService,
        @inject(Types.Lib) @named('request') private requestApi: typeof Request
    ) {
        super(Commands.PRICETICKER_FETCH);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        if (data.params.length > 0) {
            const currencies = data.params;
            for (const currency of currencies) { // INR, USD
                const apiData: any = await this.getLatestData(currency);
                for (const res of apiData) {
                    // find and check
                    const searchData: PriceTicker = await this.priceTickerService.search(currency, res.id);
                    if (searchData) {
                        await this.priceTickerService.checkAndUpdatePriceTicker(searchData as PriceTicker, res);
                    } else {
                        await this.priceTickerService.create({
                            crypto_id: res.id,
                            crypto_name: res.name,
                            crypto_symbol: res.symbol,
                            crypto_price_usd: res.price_usd,
                            crypto_price_btc: res.price_btc,
                            crypto_price_currency: res[`price_${currency.toLowerCase()}`],
                            convert_currency: currency
                        } as PriceTickerCreateRequest);
                    }
                }
            }
        } else {
            throw new MessageException('Currency can\'t be blank');
        }
    }

    public help(): string {
        return this.getName() + ' [<currency1>, <currency2>]\n'
            + '    <currency1>     - The currency for which we need to fetch top 200 currency.\n';
    }

    public description(): string {
        return 'Command to fetch currency tickers';
    }

    /**
     * call api for getting latest data to update
     *
     * @param currency : currency
     * @returns {<any>}
     */
    private async getLatestData(currency: string): Promise<any> {
        try {
            return new Promise<any>((resolve, reject) => {
                Request(`https://api.coinmarketcap.com/v1/ticker/?convert=${currency}&limit=200`, async (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(JSON.parse(body));
                });
            }).catch(() => {
                throw new MessageException(`Invalid currency ${currency}`);
            });
        } catch (err) {
            throw new MessageException(`Invalid currency ${currency}`);
        }
    }
}
