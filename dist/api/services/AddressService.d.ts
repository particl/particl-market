import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { AddressRepository } from '../repositories/AddressRepository';
import { Address } from '../models/Address';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { AddressUpdateRequest } from '../requests/AddressUpdateRequest';
export declare class AddressService {
    addressRepo: AddressRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(addressRepo: AddressRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Address>>;
    findOne(id: number, withRelated?: boolean): Promise<Address>;
    create(body: AddressCreateRequest): Promise<Address>;
    update(id: number, body: AddressUpdateRequest): Promise<Address>;
    destroy(id: number): Promise<void>;
}
