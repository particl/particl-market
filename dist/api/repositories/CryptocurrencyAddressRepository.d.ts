import * as Bookshelf from 'bookshelf';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { Logger as LoggerType } from '../../core/Logger';
export declare class CryptocurrencyAddressRepository {
    CryptocurrencyAddressModel: typeof CryptocurrencyAddress;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(CryptocurrencyAddressModel: typeof CryptocurrencyAddress, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<CryptocurrencyAddress>>;
    findOne(id: number, withRelated?: boolean): Promise<CryptocurrencyAddress>;
    create(data: any): Promise<CryptocurrencyAddress>;
    update(id: number, data: any): Promise<CryptocurrencyAddress>;
    destroy(id: number): Promise<void>;
}
