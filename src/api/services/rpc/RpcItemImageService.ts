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
import * as _ from 'lodash';

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
     *  [1]: hash
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
           hash: data.params[1],
           data: {
               dataId: data.params[2] || '',
               protocol: data.params[3] || '',
               encoding: data.params[4] || '',
               data: data.params[5] || ''
           }
        });
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_id
     *
     */
    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        // find listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();
        const itemImages = itemInformation.ItemImages;

        // check if item already been posted
        if (itemInformation.listingItemId) {
            throw new MessageException(`Can't delete itemImage because the item has allready been posted!`);
        }
        // if itemImages does not exist
        if (itemImages.length === 0) {
            this.log.warn(`ListingItemTemplate with the item id=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        }

        for (const itemImage of itemImages) {
           // remove itemImage
           await this.itemImageService.destroy(itemImage.id);
           // remove related itemImageData
           await this.itemImageDataService.destroy(itemImage.ItemImageData.id);
        }
    }

}
