// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { ItemImage } from '../../models/ItemImage';

export class ListingItemTemplateFeatureImageCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_FEATURED_IMAGE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: itemImageId
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemImage> {
        // find the listing item template
        const listingItemTemplateModel = await this.listingItemTemplateService.findOne(data.params[0]);
        const listingItemTemplate = listingItemTemplateModel.toJSON();

        const itemImages = listingItemTemplate.ItemInformation.ItemImages;
        if (!itemImages.find((img) => img.id === data.params[1])) {
            this.log.error('IMAGE ID DOESNT EXIST ON TEMPLATE');
            throw new MessageException('imageId doesnt exist on template');
        }
        return await this.listingItemTemplateService.setFeaturedImage(listingItemTemplate, data.params[1]);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: itemImageId
     * @param data
     * @returns {Promise<ItemImage>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // check if we got all the params
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('itemImageId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('itemImageId', 'number');
        }

        const itemImageModel = await this.itemImageService.findOne(data.params[1]);
        const itemImage = itemImageModel.toJSON();

        this.log.debug('itemImage: ', JSON.stringify(itemImage, null, 2));
        // check if item already been posted
        if (!_.isEmpty(itemImage.ItemInformation.ListingItem) && itemImage.ItemInformation.ListingItem.id) {
            throw new MessageException(`Can't set featured flag on ItemImage because the ListingItemTemplate has already been posted!`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <templateId> <itemImageId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '   <templateId>                 - Numeric - The Id of the ListingItemTemplate the Image belongs to.' + ' \n'
            + '   <itemImageId>                - Numeric - The Id of the Image we want to remove.';
    }

    public description(): string {
        return 'Set an item image as a featured image, identified by its Id.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
