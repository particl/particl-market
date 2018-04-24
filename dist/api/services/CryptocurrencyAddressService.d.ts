import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { CryptocurrencyAddressRepository } from '../repositories/CryptocurrencyAddressRepository';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../requests/CryptocurrencyAddressUpdateRequest';
export declare class CryptocurrencyAddressService {
    cryptocurrencyAddressRepo: CryptocurrencyAddressRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(cryptocurrencyAddressRepo: CryptocurrencyAddressRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<CryptocurrencyAddress>>;
    findOne(id: number, withRelated?: boolean): Promise<CryptocurrencyAddress>;
    create(body: CryptocurrencyAddressCreateRequest): Promise<CryptocurrencyAddress>;
    update(id: number, body: CryptocurrencyAddressUpdateRequest): Promise<CryptocurrencyAddress>;
    destroy(id: number): Promise<void>;
}
