// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/model/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ItemImage } from '../../models/ItemImage';
import {ModelNotModifiableException} from '../../exceptions/ModelNotModifiableException';

export class ListingItemTemplateFeatureImageCommand extends BaseCommand implements RpcCommandInterface<ItemImage> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_FEATURED_IMAGE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: itemImage: resources.ItemImage
     * @param data
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemImage> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const itemImage: resources.ItemImage = data.params[1];

        return await this.listingItemTemplateService.setFeaturedImage(listingItemTemplate, itemImage.id);
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

        // make sure required data exists and fetch it
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => value.toJSON());

        const itemImage: resources.ItemImage = await this.itemImageService.findOne(data.params[1], true)
            .then(value => value.toJSON());

        // this.log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

        // make sure the given image is assigned to the template
        const foundImage: resources.ItemImage | undefined = _.find(listingItemTemplate.ItemInformation.ItemImages, img => {
            this.log.debug(img.id + ' === ' + itemImage.id + ' = ' + (img.id === itemImage.id));
            return img.id === itemImage.id;
        });
        if (_.isEmpty(foundImage)) {
            this.log.error('IMAGE ID DOESNT EXIST ON TEMPLATE');
            throw new MessageException('imageId doesnt exist on template');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;
        data.params[1] = foundImage;

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
