import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { ItemImageService } from '../services/ItemImageService';
import { ImagePostUploadRequest } from '../requests/ImagePostUploadRequest';
import * as resources from 'resources';
export declare class ItemImageHttpUploadService {
    private listingItemTemplateService;
    private itemImageService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(listingItemTemplateService: ListingItemTemplateService, itemImageService: ItemImageService, Logger: typeof LoggerType);
    httpPostImageUpload(uploadRequest: ImagePostUploadRequest): Promise<resources.ItemImage[]>;
}
