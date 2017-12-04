import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../ItemImageService';
import { ItemImageDataService } from '../ItemImageDataService';
import { ListingItemTemplateService } from '../ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemImage } from '../../models/ItemImage';
import { MessageException } from '../../exceptions/MessageException';
import { NotFoundException } from '../../exceptions/NotFoundException';
import * as crypto from 'crypto-js';

export class RpcItemImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) private itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *  [2]: dataId
     *  [3]: protocol
     *  [4]: encoding
     *  [5]: data
     *
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<ItemImage> {
        // find listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // create item images
        return await this.itemImageService.create({
           item_information_id: itemInformation.id,
           // we will replace this generate hash later
           hash: crypto.SHA256(new Date().getTime().toString()).toString(),
           data: {
               dataId: data.params[1] || '',
               protocol: data.params[2] || '',
               encoding: data.params[3] || '',
               data: data.params[4] || ''
           }
        });
    }

    /**
     * data.params[]:
     *  [0]: ItemImage.Id
     *
     */
    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.itemImageService.destroy(data.params[0]);
    }

}
