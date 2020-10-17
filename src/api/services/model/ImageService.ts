// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ImageRepository } from '../../repositories/ImageRepository';
import { Image } from '../../models/Image';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';
import { ImageDataCreateRequest } from '../../requests/model/ImageDataCreateRequest';
import { ImageUpdateRequest } from '../../requests/model/ImageUpdateRequest';
import { ImageDataService } from './ImageDataService';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { ImageDataRepository } from '../../repositories/ImageDataRepository';
import { ImageVersion } from '../../../core/helpers/ImageVersion';
import { ImageProcessing } from '../../../core/helpers/ImageProcessing';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CoreMessageVersion } from '../../enums/CoreMessageVersion';
import { MessageVersions } from '../../messages/MessageVersions';


export class ImageService {

    public log: LoggerType;

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Repository) @named(Targets.Repository.ImageRepository) public imageRepository: ImageRepository,
        @inject(Types.Repository) @named(Targets.Repository.ImageDataRepository) public imageDataRepository: ImageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Image>> {
        return this.imageRepository.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Image> {
        const image = await this.imageRepository.findOne(id, withRelated);
        if (image === null) {
            this.log.warn(`Image with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return image;
    }

    /**
     * Return all Images with a certain hash.
     * There could be several, since the same image file could be used in multiple ListingItems.
     *
     * @param hash
     * @param withRelated
     */
    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Image>> {
        return await this.imageRepository.findAllByHash(hash, withRelated);
    }

    public async findAllByTarget(target: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Image>> {
        return await this.imageRepository.findAllByTarget(target, withRelated);
    }

    public async findAllByHashAndTarget(hash: string, target: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Image>> {
        return await this.imageRepository.findAllByHashAndTarget(hash, target, withRelated);
    }

    /**
     * creates multiple different version of given image
     *
     * @param data
     */
    @validate()
    public async create( @request(ImageCreateRequest) data: ImageCreateRequest): Promise<Image> {
        const body: ImageCreateRequest = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        // find the ImageVersions.ORIGINAL from the existing ImageDatas
        // the ORIGINAL should always exist, its used to create the other versions
        // it should also be the only version...
        const imageDataCreateRequestOriginal: ImageDataCreateRequest | undefined = _.find(body.data, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        delete body.data;

        if (imageDataCreateRequestOriginal) {

            // this.log.debug('body: ', JSON.stringify(body, null, 2));
            const image: resources.Image = await this.imageRepository.create(body).then(value => value.toJSON());

            // then create the ORIGINAL ImageData
            imageDataCreateRequestOriginal.image_id = image.id;

            await this.imageDataService.create(imageDataCreateRequestOriginal).then(value => value.toJSON());

            // then create the other versions from the given original data,
            // original is automatically added as one of the versions
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            await this.createVersions(imageDataCreateRequestOriginal, toVersions);

            return await this.findOne(image.id);
        } else {
            throw new MessageException('Original ImageData not found.');
        }
    }

    /**
     * creates ImageDatas for the required Image versions from the original ImageDataCreateRequest
     *
     * @param {ImageDataCreateRequest} originalImageData
     * @param {ImageVersion[]} toVersions
     * @returns {Promise<ImageDataCreateRequest[]>}
     */
    public async createVersions(originalImageData: ImageDataCreateRequest, toVersions: ImageVersion[]): Promise<resources.ImageData[]> {

        let startTime = Date.now();
        const imageDatas: resources.ImageData[] = [];

        // this.log.debug('createVersions(), originalImageData: ', JSON.stringify(originalImageData, null, 2));

        if (originalImageData.data) {
            const originalData = await ImageProcessing.convertToJPEG(originalImageData.data);
            this.log.debug('createVersions(), convertToJPEG: ' + (Date.now() - startTime) + 'ms');

            startTime = Date.now();
            const resizedDatas: Map<string, string> = await ImageProcessing.resizeImageData(originalData, toVersions);
            this.log.debug('createVersions() resizeImageData: ' + (Date.now() - startTime) + 'ms');

            for (const version of toVersions) {
                const versionCreateRequest: ImageDataCreateRequest = JSON.parse(JSON.stringify(originalImageData));
                versionCreateRequest.imageVersion = version.propName;
                versionCreateRequest.data = resizedDatas.get(version.propName) || '';

                await this.imageDataService.create(versionCreateRequest).then(value => {
                    imageDatas.push(value.toJSON());
                });
            }

        } else {
            // when there is no data, we received ListingItemAddMessage and we are expecting to receive the data via smsg later
            // original version has already been created, so theres nothing more to do
        }

        // this.log.debug('createVersions(), created imageDatas: ', JSON.stringify(imageDatas, null, 2));
        return imageDatas;
    }

    public async createResizedVersion(id: number, messageVersionToFit: CoreMessageVersion, scalingFraction: number = 0.9, qualityFraction: number = 0.95,
                                      maxIterations: number = 10): Promise<resources.ImageData[]> {

        const image: resources.Image = await this.findOne(id).then(value => value.toJSON());
        const imageDataOriginal: resources.ImageData | undefined = _.find(image.ImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        const imageDataResized: resources.ImageData | undefined = _.find(image.ImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.RESIZED.propName;
        });

        if (_.isNil(imageDataOriginal)) {
            throw new ModelNotFoundException('ImageData');
        }

        imageDataOriginal.data = await this.imageDataService.loadImageFile(image.hash, ImageVersions.ORIGINAL.propName);

        const rawImage = imageDataOriginal.data;
        const maxSize = MessageVersions.maxSize(messageVersionToFit);

        const resizedImage = await ImageProcessing.resizeImageToSize(rawImage, maxSize, scalingFraction, qualityFraction, maxIterations);

        this.log.debug('resized image size: ', resizedImage.length);

        const versionCreateOrUpdateRequest = {
            image_id: image.id,
            protocol: imageDataOriginal.protocol,
            imageVersion: ImageVersions.RESIZED.propName,
            imageHash: image.hash,
            encoding: imageDataOriginal.encoding,
            data: resizedImage
        } as ImageDataCreateRequest;

        // resized could already exist, so create/update
        if (_.isNil(imageDataResized)) {
            return await this.imageDataService.create(versionCreateOrUpdateRequest).then(value => value.toJSON());
        } else {
            return await this.imageDataService.update(imageDataResized.id, versionCreateOrUpdateRequest).then(value => value.toJSON());
        }
    }

    @validate()
    public async update(id: number, @request(ImageUpdateRequest) data: ImageUpdateRequest): Promise<Image> {
        const body: ImageUpdateRequest = JSON.parse(JSON.stringify(data));

        const imageDataUpdateRequestOriginal: ImageDataCreateRequest | undefined = _.find(body.data, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });
        delete body.data;

        if (imageDataUpdateRequestOriginal) {
            const image = await this.findOne(id, false);
            image.Hash = body.hash;
            image.Featured = body.featured;
            const updatedImage: resources.Image = await this.imageRepository.update(id, image.toJSON()).then(value => value.toJSON());

            // then remove old related ImageDatas and files
            for (const imageData of updatedImage.ImageDatas) {
                await this.imageDataService.destroy(imageData.id);
            }

            // then recreate the other ImageDatas from the original data
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            await this.createVersions(imageDataUpdateRequestOriginal, toVersions);

            return await this.findOne(updatedImage.id);

        } else {
            throw new MessageException('Original ImageData not found.');
        }
    }


    public async updateItemInformation(id: number, itemInformationId: number): Promise<Image> {
        const image = await this.findOne(id, false);
        image.set('itemInformationId', itemInformationId);
        await this.imageRepository.update(id, image.toJSON()).then(value => value.toJSON());
        return await this.findOne(id, true);
    }


    public async updateFeatured(id: number, featured: boolean): Promise<Image> {
        const data = {
            featured
        } as ImageUpdateRequest;
        return await this.imageRepository.update(id, data);
    }


    public async destroy(id: number): Promise<void> {
        const image: resources.Image = await this.findOne(id, true).then(value => value.toJSON());
        this.log.debug('destroy(), remove image, hash: ', image.hash);

        // find and remove ImageDatas and files
        for (const imageData of image.ImageDatas) {
            await this.imageDataService.destroy(imageData.id);
        }

        await this.imageRepository.destroy(id);
    }
}
