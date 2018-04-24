import * as Bookshelf from 'bookshelf';
import { PaymentInformation } from '../models/PaymentInformation';
import { Logger as LoggerType } from '../../core/Logger';
export declare class PaymentInformationRepository {
    PaymentInformationModel: typeof PaymentInformation;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(PaymentInformationModel: typeof PaymentInformation, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<PaymentInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<PaymentInformation>;
    create(data: any): Promise<PaymentInformation>;
    update(id: number, data: any): Promise<PaymentInformation>;
    destroy(id: number): Promise<void>;
}
