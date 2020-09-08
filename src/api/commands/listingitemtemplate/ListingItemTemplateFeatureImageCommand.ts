// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ImageService } from '../../services/model/ImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { Image } from '../../models/Image';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';

export class ListingItemTemplateFeatureImageCommand extends BaseCommand implements RpcCommandInterface<Image> {

    public paramValidationRules = {
        parameters: [{
            name: 'listingItemTemplateId',
            required: true,
            type: 'number'
        }, {
            name: 'imageId',
            required: true,
            type: 'number'
        }] as ParamValidationRule[]
    } as CommandParamValidationRules;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_FEATURED_IMAGE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: itemImage: resources.Image
     * @param data
     * @returns {Promise<Image>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Image> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const image: resources.Image = data.params[1];

        return await this.listingItemTemplateService.setFeaturedImage(listingItemTemplate, image.id);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: imageId
     * @param data
     * @returns {Promise<Image>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const listingItemTemplateId = data.params[0];
        const imageId = data.params[1];

        // make sure required data exists and fetch it
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId)
            .then(value => value.toJSON());

        const itemImage: resources.Image = await this.imageService.findOne(imageId, true)
            .then(value => value.toJSON());

        // this.log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

        // make sure the given image is assigned to the template
        const foundImage: resources.Image | undefined = _.find(listingItemTemplate.ItemInformation.Images, img => {
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
        return this.getName() + ' <listingItemTemplateId> <imageId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '   <listingItemTemplateId>       - Numeric - The Id of the ListingItemTemplate the Image belongs to.' + ' \n'
            + '   <imageId>                     - Numeric - The Id of the Image we want to set as featured.';
    }

    public description(): string {
        return 'Set an item image as a featured image, identified by its Id.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
