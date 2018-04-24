import * as Bookshelf from 'bookshelf';
import { Address } from '../models/Address';
import { Logger as LoggerType } from '../../core/Logger';
export declare class AddressRepository {
    AddressModel: typeof Address;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(AddressModel: typeof Address, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Address>>;
    findOne(id: number, withRelated?: boolean): Promise<Address>;
    create(data: any): Promise<Address>;
    update(id: number, data: any): Promise<Address>;
    destroy(id: number): Promise<void>;
}
