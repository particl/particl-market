import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { Escrow } from '../models/Escrow';
import { EscrowRepository } from '../repositories/EscrowRepository';
import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../requests/EscrowUpdateRequest';
import { EscrowRatioService } from '../services/EscrowRatioService';
import { AddressService } from '../services/AddressService';
export declare class EscrowService {
    escrowRepo: EscrowRepository;
    escrowRatioService: EscrowRatioService;
    addressService: AddressService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(escrowRepo: EscrowRepository, escrowRatioService: EscrowRatioService, addressService: AddressService, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<Escrow>>;
    findOne(id: number, withRelated?: boolean): Promise<Escrow>;
    create(data: EscrowCreateRequest): Promise<Escrow>;
    update(id: number, data: EscrowUpdateRequest): Promise<Escrow>;
    destroy(id: number): Promise<void>;
}
