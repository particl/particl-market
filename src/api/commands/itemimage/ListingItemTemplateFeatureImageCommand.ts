// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ListingItemTemplateFeatureImageCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMIMAGE_FEATURED);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing_item_template_ID
     *  [1]: featured_item_image_ID
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        // check if we got all the params
        if (data.params.length < 1) {
            this.log.error('MISSING PARAM ListingItemTemplate_ID');
            throw new InvalidParamException('ListingItemTemplate_ID');
        } else if (data.params.length < 2) {
            this.log.error('MISSING PARAM FeaturedImage_ID');
            throw new InvalidParamException('Featured_ID');
        }
        if (typeof data.params[0] !== 'number') {
            this.log.error('Typeof Error');
            throw new InvalidParamException('ListingItemTemplate_ID', 'integer');
        } else if (typeof data.params[1] !== 'number') {
            this.log.error('Typeof Error');
            throw new InvalidParamException('Featured_ID', 'integer');
        }
        const itemImageModel = await this.itemImageService.findOne(data.params[1]);
        const itemImage = itemImageModel.toJSON();

        // check if item already been posted
        if (itemImage.ItemInformation.listingItemId) {
            this.log.error('IMAGE IS ALREADY POSTED');
            throw new MessageException(`Can't set featured itemImage because the item has allready been posted!`);
        }
        this.log.error('here:', data[0]);
        // find the listing item template
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        const itemImages = listingItemTemplate.ItemInformation.ItemImages;
        if (!itemImages.find((img) => img.id === data.params[1])) {
            this.log.error('IMAGE ID DOESNT EXIST ON TEMPLATE');
            throw new MessageException('Image ID doesnt exist on template');
        }
        return await this.listingItemTemplateService.setFeaturedImg(listingItemTemplate, data.params[1]);
    }

    public usage(): string {
        return this.getName() + ' <templateID> <itemImageId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '   <templateID> <itemImageId>                 - Numeric - The ID of the image we want to remove.';
    }

    public description(): string {
        return 'Set an item image as a featured image, identified by its ID.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
