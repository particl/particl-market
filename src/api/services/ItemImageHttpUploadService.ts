import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ListingItemTemplate } from '../models/ListingItemTemplate';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { ItemImageService } from '../services/ItemImageService';
import { ImagePostUploadRequest } from '../requests/ImagePostUploadRequest';

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
    public async httpPostImageUpload(@request(ImagePostUploadRequest) uploadRequest: ImagePostUploadRequest): Promise<any> {
        const listItems: any[] = [];
        const listingItemTemplate: ListingItemTemplate = await this.listingItemTemplateService.findOne(uploadRequest.id);
        for ( const file of uploadRequest.request.files ) {
            const tmpImage = await this.itemImageService.createFile(uploadRequest.id, file, listingItemTemplate);
            const imageDatas = tmpImage.ItemImageDatas;
            for ( const i in imageDatas ) {
                if ( i ) {
                    const tmpImageData: any = imageDatas[i];
                    tmpImageData.data = 'http://../../../item-image-data/' + tmpImageData.id;
                    listItems.push(tmpImageData);
                }
            }
        }
        return listItems;
    }
}
