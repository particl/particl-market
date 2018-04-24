import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { PaymentInformationRepository } from '../repositories/PaymentInformationRepository';
import { PaymentInformation } from '../models/PaymentInformation';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { EscrowService } from './EscrowService';
import { ItemPriceService } from './ItemPriceService';
export declare class PaymentInformationService {
    itemPriceService: ItemPriceService;
    escrowService: EscrowService;
    paymentInformationRepo: PaymentInformationRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemPriceService: ItemPriceService, escrowService: EscrowService, paymentInformationRepo: PaymentInformationRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<PaymentInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<PaymentInformation>;
    create(data: PaymentInformationCreateRequest): Promise<PaymentInformation>;
    update(id: number, data: PaymentInformationUpdateRequest): Promise<PaymentInformation>;
    destroy(id: number): Promise<void>;
}
