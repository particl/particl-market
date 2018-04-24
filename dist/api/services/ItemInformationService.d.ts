import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemInformationRepository } from '../repositories/ItemInformationRepository';
import { ItemInformation } from '../models/ItemInformation';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { ItemLocationService } from './ItemLocationService';
import { ItemImageService } from './ItemImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ItemCategoryService } from './ItemCategoryService';
export declare class ItemInformationService {
    itemCategoryService: ItemCategoryService;
    itemImageService: ItemImageService;
    shippingDestinationService: ShippingDestinationService;
    itemLocationService: ItemLocationService;
    itemInformationRepo: ItemInformationRepository;
    listingItemTemplateRepository: ListingItemTemplateRepository;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemCategoryService: ItemCategoryService, itemImageService: ItemImageService, shippingDestinationService: ShippingDestinationService, itemLocationService: ItemLocationService, itemInformationRepo: ItemInformationRepository, listingItemTemplateRepository: ListingItemTemplateRepository, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemInformation>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemInformation>;
    findByItemTemplateId(listingItemTemplateId: number, withRelated?: boolean): Promise<ItemInformation>;
    create(data: ItemInformationCreateRequest): Promise<ItemInformation>;
    updateWithCheckListingTemplate(body: ItemInformationUpdateRequest): Promise<ItemInformation>;
    update(id: number, data: ItemInformationUpdateRequest): Promise<ItemInformation>;
    destroy(id: number): Promise<void>;
    /**
     * fetch or create the given ItemCategory from db
     * @param itemCategory
     * @returns {Promise<ItemCategory>}
     */
    private getOrCreateItemCategory(itemCategory);
}
