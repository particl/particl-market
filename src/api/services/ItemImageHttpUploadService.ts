import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { ItemImageService } from '../services/ItemImageService';
import { ImagePostUploadRequest } from '../requests/ImagePostUploadRequest';
import * as resources from 'resources';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';

export class ItemImageHttpUploadService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    @validate()
    public async httpPostImageUpload(@request(ImagePostUploadRequest) uploadRequest: ImagePostUploadRequest): Promise<resources.ItemImage[]> {

        // TODO: ImagePostUploadRequest.id, should be names templateId and not just some random id
        const createdItemImages: resources.ItemImage[] = [];
        const listingItemTemplate: ListingItemTemplate = await this.listingItemTemplateService.findOne(uploadRequest.id);

        for ( const file of uploadRequest.request.files ) {
            const createdItemImage = await this.itemImageService.createFile(file, listingItemTemplate);
            createdItemImages.push(createdItemImage.toJSON());
        }
        return createdItemImages;
    }
}
