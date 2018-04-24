import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { Profile } from '../models/Profile';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { AddressService } from './AddressService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { CoreRpcService } from './CoreRpcService';
import { ShoppingCartService } from './ShoppingCartService';
export declare class ProfileService {
    addressService: AddressService;
    cryptocurrencyAddressService: CryptocurrencyAddressService;
    shoppingCartService: ShoppingCartService;
    profileRepo: ProfileRepository;
    coreRpcService: CoreRpcService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(addressService: AddressService, cryptocurrencyAddressService: CryptocurrencyAddressService, shoppingCartService: ShoppingCartService, profileRepo: ProfileRepository, coreRpcService: CoreRpcService, Logger: typeof LoggerType);
    getDefault(withRelated?: boolean): Promise<Profile>;
    findAll(): Promise<Bookshelf.Collection<Profile>>;
    findOne(id: number, withRelated?: boolean): Promise<Profile>;
    findOneByName(name: string, withRelated?: boolean): Promise<Profile>;
    findOneByAddress(name: string, withRelated?: boolean): Promise<Profile>;
    create(data: ProfileCreateRequest): Promise<Profile>;
    getNewAddress(): Promise<string>;
    update(id: number, data: any): Promise<Profile>;
    destroy(id: number): Promise<void>;
}
