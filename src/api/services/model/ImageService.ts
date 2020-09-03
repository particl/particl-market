// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as fs from 'fs';
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
import { ImageFactory } from '../../factories/ImageFactory';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { ImageDataRepository } from '../../repositories/ImageDataRepository';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableImageCreateRequestConfig } from '../../factories/hashableconfig/createrequest/HashableImageCreateRequestConfig';
import { ImageDataUpdateRequest } from '../../requests/model/ImageDataUpdateRequest';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Repository) @named(Targets.Repository.ImageRepository) public imageRepository: ImageRepository,
        @inject(Types.Repository) @named(Targets.Repository.ImageDataRepository) public imageDataRepository: ImageDataRepository,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
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
     * There could be several, since the same image could be used in multiple ListingItems.
     *
     * @param hash
     * @param withRelated
     */
    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Image>> {
        return await this.imageRepository.findAllByHash(hash, withRelated);
    }

    /**
     * create(), but get data from a local file instead.
     * used to create the ORIGINAL image version from the uploaded file
     *
     * @param imageFile
     * @param itemInformationId
     * @returns {Promise<Image>}
     */
    @validate()
    public async createFromFile(imageFile: any, itemInformationId: number): Promise<Image> {
        // TODO: ADD TYPE TO imageFile!!

        const dataStr = fs.readFileSync(imageFile.path, 'base64');

        // TODO: use factory
        const imageDataCreateRequest = {
            dataId: imageFile.fieldname, // replaced with local url in factory
            protocol: ProtocolDSN.FILE,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: dataStr,
            originalMime: imageFile.mimetype,
            originalName: imageFile.originalname
        } as ImageDataCreateRequest;

        // TODO: use factory
        const imageCreateRequest = {
            item_information_id: itemInformationId,
            data: [imageDataCreateRequest]
        } as ImageCreateRequest;

        imageCreateRequest.hash = ConfigurableHasher.hash(imageCreateRequest, new HashableImageCreateRequestConfig());

        return await this.create(imageCreateRequest);
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
        // also when receiving a ListingItem, it should be the only one we receive
        const imageDataCreateRequests: ImageDataCreateRequest[] = body.data;
        const imageDataOriginal = _.find(imageDataCreateRequests, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        // remove ImageDatas from the body
        delete body.data;

        if (imageDataOriginal) {

            if (!EnumHelper.containsValue(ProtocolDSN, imageDataOriginal.protocol)) {
                this.log.warn(`Invalid protocol <${imageDataOriginal.protocol}> encountered.`);
                throw new InvalidParamException('data.protocol', 'ProtocolDSN');
            }

            // if (_.isEmpty(imageDataOriginal.data)) {
            //     throw new MessageException('Image data not found.');
            // }

            // create the Image
            const image: resources.Image = await this.imageRepository.create(body).then(value => value.toJSON());

            // then create the other imageDatas from the given original data,
            // original is automatically added as one of the versions
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            const imageDatas: ImageDataCreateRequest[] = await this.imageFactory.getImageDatas(image.id, image.hash, imageDataOriginal,
                toVersions);

            // save all ImageDatas
            for (const imageData of imageDatas) {
                await this.imageDataService.create(imageData);
            }

            // finally find and return the created image
            return await this.findOne(image.id);
        } else {
            throw new MessageException('Original image data not found.');
        }
    }

    @validate()
    public async update(id: number, @request(ImageUpdateRequest) data: ImageUpdateRequest): Promise<Image> {
        const body: ImageUpdateRequest = JSON.parse(JSON.stringify(data));

        // grab the existing imagedatas
        const imageDatas: ImageDataUpdateRequest[] = body.data;

        // find the original out of those
        const imageDataOriginal = _.find(imageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        delete body.data;

        if (imageDataOriginal) {

            if (!EnumHelper.containsValue(ProtocolDSN, imageDataOriginal.protocol)) {
                this.log.warn(`Invalid protocol <${imageDataOriginal.protocol}> encountered.`);
                throw new InvalidParamException('data.protocol', 'ProtocolDSN');
            }

            if (_.isEmpty(imageDataOriginal.data)) {
                throw new MessageException('Image data not found.');
            }

            // first update the Image
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

            // todo: imageDataFactory
            const newImageDatas: ImageDataCreateRequest[] = await this.imageFactory.getImageDatas(
                image.Id, image.Hash, imageDataOriginal, toVersions);

            // save all ImageDatas
            for (const imageData of newImageDatas) {
                // todo: update
                await this.imageDataService.create(imageData);
            }
            return await this.findOne(updatedImage.id);

        } else {
            throw new MessageException('Original image data not found.');
        }
    }

    public async updateFeatured(imageId: number, featured: boolean): Promise<Image> {
        const data = {
            featured
        } as ImageUpdateRequest;
        return await this.imageRepository.update(imageId, data);
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
