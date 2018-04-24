import * as Bookshelf from 'bookshelf';
import { PriceTicker } from '../models/PriceTicker';
import { Logger as LoggerType } from '../../core/Logger';
export declare class PriceTickerRepository {
    PriceTickerModel: typeof PriceTicker;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(PriceTickerModel: typeof PriceTicker, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<PriceTicker>>;
    findOne(id: number, withRelated?: boolean): Promise<PriceTicker>;
    create(data: any): Promise<PriceTicker>;
    update(id: number, data: any): Promise<PriceTicker>;
    getOneBySymbol(currency: string): Promise<PriceTicker>;
    destroy(id: number): Promise<void>;
}
