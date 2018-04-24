import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { CurrencyPriceService } from '../../services/CurrencyPriceService';
import * as resources from 'resources';
export declare class CurrencyPriceRootCommand extends BaseCommand implements RpcCommandInterface<resources.CurrencyPrice[]> {
    private currencyPriceService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(currencyPriceService: CurrencyPriceService, Logger: typeof LoggerType);
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
     * @returns {Promise<"resources".CurrencyPrice[]>}
     *
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.CurrencyPrice[]>;
    usage(): string;
    help(): string;
    description(): string;
    example(): any;
}
