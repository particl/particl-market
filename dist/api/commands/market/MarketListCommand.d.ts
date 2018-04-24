import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { MarketService } from '../../services/MarketService';
export declare class MarketListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Market>> {
    Logger: typeof LoggerType;
    private marketService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, marketService: MarketService);
    /**
     * @param data
     * @returns {Promise<Bookshelf.Collection<Market>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<Market>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
