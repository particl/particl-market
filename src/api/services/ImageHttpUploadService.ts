// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ListingItemTemplateService } from './model/ListingItemTemplateService';
import { ImageService } from './model/ImageService';
import { ImageUploadRequest } from '../requests/action/ImageUploadRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';

export class ImageHttpUploadService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) private imageService: ImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * uploadRequest.listingItemTemplateId
     * uploadRequest.requestBody
     * uploadRequest.request
     * uploadRequest.request.files          - [] of something todo: add type
     *          imageFile.path
     *          imageFile.fieldname
     *          imageFile.mimetype
     *          imageFile.originalname
     *          ...?
     *
     * @param uploadRequest
     */
    @validate()
    public async httpPostImageUpload(@request(ImageUploadRequest) uploadRequest: ImageUploadRequest): Promise<resources.Image[]> {

        const createdImages: resources.Image[] = [];

        if (!_.isNil(uploadRequest.listingItemTemplateId)) {
            let listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(uploadRequest.listingItemTemplateId)
                .then(value => value.toJSON());

            for (const file of uploadRequest.request.files) {
                const createdImage: resources.Image = await this.imageService.createFromFile(file, listingItemTemplate.ItemInformation.id)
                    .then(value => value.toJSON());
                createdImages.push(createdImage);
            }

            // after upload reload and create also the resized template images
            listingItemTemplate = await this.listingItemTemplateService.findOne(uploadRequest.listingItemTemplateId).then(value => value.toJSON());
            await this.listingItemTemplateService.createResizedTemplateImages(listingItemTemplate);
        } else {
            // TODO: handle market image uploads
            throw NotImplementedException();
        }

        return createdImages;
    }
}
