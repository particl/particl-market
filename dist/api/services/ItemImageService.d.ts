import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemImageRepository } from '../repositories/ItemImageRepository';
import { ItemImage } from '../models/ItemImage';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { ItemImageUpdateRequest } from '../requests/ItemImageUpdateRequest';
import { ItemImageDataService } from './ItemImageDataService';
import { ImageFactory } from '../factories/ImageFactory';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
export declare class ItemImageService {
    itemImageDataService: ItemImageDataService;
    itemImageRepo: ItemImageRepository;
    imageFactory: ImageFactory;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(itemImageDataService: ItemImageDataService, itemImageRepo: ItemImageRepository, imageFactory: ImageFactory, Logger: typeof LoggerType);
    findAll(): Promise<Bookshelf.Collection<ItemImage>>;
    findOne(id: number, withRelated?: boolean): Promise<ItemImage>;
    /**
     * create(), but get data from a local file instead.
     *
     * @param imageFile
     * @param {ListingItemTemplate} listingItemTemplate
     * @returns {Promise<ItemImage>}
     */
    createFile(imageFile: any, listingItemTemplate: ListingItemTemplate): Promise<ItemImage>;
    create(data: ItemImageCreateRequest): Promise<ItemImage>;
    update(id: number, data: ItemImageUpdateRequest): Promise<ItemImage>;
    destroy(id: number): Promise<void>;
}
