import { Logger as LoggerType } from '../../../core/Logger';
import { PaymentInformationService } from '../../services/PaymentInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { PaymentInformation } from '../../models/PaymentInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
export declare class PaymentInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<PaymentInformation> {
    Logger: typeof LoggerType;
    private listingItemTemplateService;
    private paymentInformationService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, listingItemTemplateService: ListingItemTemplateService, paymentInformationService: PaymentInformationService);
    /**
     * data.params[]:
     *  [0]: ListingItemTemplate.id
     *  [1]: payment type
     *  [2]: currency
     *  [3]: base price
     *  [4]: domestic shipping price
     *  [5]: international shipping price
     *  [6]: payment address
     *
     * @param data
     * @returns {Promise<PaymentInformation>}
     */
    execute(data: RpcRequest): Promise<PaymentInformation>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
