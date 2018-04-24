import * as Bookshelf from 'bookshelf';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { PriceTickerService } from '../../services/PriceTickerService';
import { PriceTicker } from '../../models/PriceTicker';
export declare class PriceTickerRootCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<PriceTicker>> {
    Logger: typeof LoggerType;
    private priceTickerService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, priceTickerService: PriceTickerService);
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
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<PriceTicker>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): any;
}
