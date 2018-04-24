import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ItemInformationService } from './ItemInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { MessagingInformationService } from './MessagingInformationService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { ListingItemObjectService } from './ListingItemObjectService';
import { ListingItemTemplateSearchParams } from '../requests/ListingItemTemplateSearchParams';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../requests/ListingItemTemplateUpdateRequest';
export declare class ListingItemTemplateService {
    listingItemTemplateRepo: ListingItemTemplateRepository;
    itemInformationService: ItemInformationService;
    paymentInformationService: PaymentInformationService;
    messagingInformationService: MessagingInformationService;
    cryptocurrencyAddressService: CryptocurrencyAddressService;
    listingItemObjectService: ListingItemObjectService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemTemplateRepo: ListingItemTemplateRepository, itemInformationService: ItemInformationService, paymentInformationService: PaymentInformationService, messagingInformationService: MessagingInformationService, cryptocurrencyAddressService: CryptocurrencyAddressService, listingItemObjectService: ListingItemObjectService, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ListingItemTemplate>>;
    findOne(id: number, withRelated?: boolean): Promise<ListingItemTemplate>;
    /**
     *
     * @param {string} hash
     * @param {boolean} withRelated
     * @returns {Promise<ListingItemTemplate>}
     */
    findOneByHash(hash: string, withRelated?: boolean): Promise<ListingItemTemplate>;
    /**
     * search ListingItemTemplates using given ListingItemTemplateSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemTemplate>>}
     */
    search(options: ListingItemTemplateSearchParams): Promise<Bookshelf.Collection<ListingItemTemplate>>;
    create(data: ListingItemTemplateCreateRequest, timestampedHash?: boolean): Promise<ListingItemTemplate>;
    update(id: number, data: ListingItemTemplateUpdateRequest): Promise<ListingItemTemplate>;
    destroy(id: number): Promise<void>;
    private checkExistingObject(objectArray, fieldName, value);
    private findHighestOrderNumber(listingItemObjects);
}
