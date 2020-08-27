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
import { ItemImageRepository } from '../../repositories/ItemImageRepository';
import { ItemImage } from '../../models/ItemImage';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../../requests/model/ItemImageDataCreateRequest';
import { ItemImageUpdateRequest } from '../../requests/model/ItemImageUpdateRequest';
import { ItemImageDataService } from './ItemImageDataService';
import { ImageFactory } from '../../factories/ImageFactory';
import { ImageVersions } from '../../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { ItemImageDataRepository } from '../../repositories/ItemImageDataRepository';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableItemImageCreateRequestConfig } from '../../factories/hashableconfig/createrequest/HashableItemImageCreateRequestConfig';
import {ItemImageDataUpdateRequest} from '../../requests/model/ItemImageDataUpdateRequest';
import {EnumHelper} from '../../../core/helpers/EnumHelper';
import {CreatableModel} from '../../enums/CreatableModel';
import {InvalidParamException} from '../../exceptions/InvalidParamException';

export class ItemImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) public itemImageDataService: ItemImageDataService,
        @inject(Types.Repository) @named(Targets.Repository.ItemImageRepository) public itemImageRepo: ItemImageRepository,
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataRepository) public itemImageDataRepo: ItemImageDataRepository,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImage>> {
        return this.itemImageRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImage> {
        const itemImage = await this.itemImageRepo.findOne(id, withRelated);
        if (itemImage === null) {
            this.log.warn(`ItemImage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImage;
    }

    /**
     * Return all ItemImages with a certain hash.
     * There could be several, since the same image could be used in multiple ListingItems.
     *
     * @param hash
     * @param withRelated
     */
    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ItemImage>> {
        return await this.itemImageRepo.findAllByHash(hash, withRelated);
    }

    /**
     * create(), but get data from a local file instead.
     * used to create the ORIGINAL image version from the uploaded file
     *
     * @param imageFile
     * @param itemInformationId
     * @returns {Promise<ItemImage>}
     */
    @validate()
    public async createFromFile(imageFile: any, itemInformationId: number): Promise<ItemImage> {
        // TODO: ADD TYPE TO imageFile!!

        const dataStr = fs.readFileSync(imageFile.path, 'base64');

        // TODO: use factory
        const itemImageDataCreateRequest = {
            dataId: imageFile.fieldname, // replaced with local url in factory
            protocol: ProtocolDSN.LOCAL,
            imageVersion: ImageVersions.ORIGINAL.propName,
            encoding: 'BASE64',
            data: dataStr,
            originalMime: imageFile.mimetype,
            originalName: imageFile.originalname
        } as ItemImageDataCreateRequest;

        // TODO: use factory
        const itemImageCreateRequest = {
            item_information_id: itemInformationId,
            data: [itemImageDataCreateRequest]
        } as ItemImageCreateRequest;

        itemImageCreateRequest.hash = ConfigurableHasher.hash(itemImageCreateRequest, new HashableItemImageCreateRequestConfig());

        return await this.create(itemImageCreateRequest);
    }

    /**
     * creates multiple different version of given image
     *
     * @param data
     */
    @validate()
    public async create( @request(ItemImageCreateRequest) data: ItemImageCreateRequest): Promise<ItemImage> {

        // const startTime = new Date().getTime();
        const body: ItemImageCreateRequest = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        // find the ImageVersions.ORIGINAL from the existing ItemImageDatas
        // the ORIGINAL should always exist, its used to create the other versions
        // also when receiving a ListingItem, it should be the only one we receive
        const itemImageDataCreateRequests: ItemImageDataCreateRequest[] = body.data;
        const itemImageDataOriginal = _.find(itemImageDataCreateRequests, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        // remove ItemImageDatas from the body
        delete body.data;

        if (itemImageDataOriginal) {

            if (!EnumHelper.containsValue(ProtocolDSN, itemImageDataOriginal.protocol)) {
                this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                throw new InvalidParamException('data.protocol', 'ProtocolDSN');
            }

            // if (_.isEmpty(itemImageDataOriginal.data)) {
            //     throw new MessageException('Image data not found.');
            // }

            // create the ItemImage
            const itemImage: resources.ItemImage = await this.itemImageRepo.create(body).then(value => value.toJSON());

            // then create the other imageDatas from the given original data,
            // original is automatically added as one of the versions
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            const imageDatas: ItemImageDataCreateRequest[] = await this.imageFactory.getImageDatas(itemImage.id, itemImage.hash, itemImageDataOriginal,
                toVersions);

            // save all ItemImageDatas
            for (const imageData of imageDatas) {
                await this.itemImageDataService.create(imageData);
            }

            // finally find and return the created itemImage
            const newItemImage = await this.findOne(itemImage.id);
            // this.log.debug('saved image:', JSON.stringify(newItemImage.toJSON(), null, 2));

            // this.log.debug('itemImageService.create: ' + (new Date().getTime() - startTime) + 'ms');
            return newItemImage;
        } else {
            throw new MessageException('Original image data not found.');
        }
    }

    @validate()
    public async update(id: number, @request(ItemImageUpdateRequest) data: ItemImageUpdateRequest): Promise<ItemImage> {

        const startTime = new Date().getTime();
        const body: ItemImageUpdateRequest = JSON.parse(JSON.stringify(data));

        // grab the existing imagedatas
        const itemImageDatas: ItemImageDataUpdateRequest[] = body.data;

        // find the original out of those
        const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        delete body.data;

        if (itemImageDataOriginal) {

            if (!EnumHelper.containsValue(ProtocolDSN, itemImageDataOriginal.protocol)) {
                this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                throw new InvalidParamException('data.protocol', 'ProtocolDSN');
            }

            if (_.isEmpty(itemImageDataOriginal.data)) {
                throw new MessageException('Image data not found.');
            }

            // first update the ItemImage
            const itemImage = await this.findOne(id, false);
            itemImage.Hash = body.hash;
            itemImage.Featured = body.featured;
            const updatedItemImage: resources.ItemImage = await this.itemImageRepo.update(id, itemImage.toJSON()).then(value => value.toJSON());

            // then remove old related ItemImageDatas and files
            for (const imageData of updatedItemImage.ItemImageDatas) {
                await this.itemImageDataService.destroy(imageData.id);
            }

            // then recreate the other ItemImageDatas from the original data
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];

            // todo: imageDataFactory
            const imageDatas: ItemImageDataCreateRequest[] = await this.imageFactory.getImageDatas(
                itemImage.Id, itemImage.Hash, itemImageDataOriginal, toVersions);

            // save all ItemImageDatas
            for (const imageData of imageDatas) {
                // todo: update
                await this.itemImageDataService.create(imageData);
            }

            // finally find and return the created itemImage
            const newItemImage = await this.findOne(itemImage.Id);
            // this.log.debug('saved image:', JSON.stringify(newItemImage.toJSON(), null, 2));

            this.log.debug('itemImageService.update: ' + (new Date().getTime() - startTime) + 'ms');
            return newItemImage;

        } else {
            throw new MessageException('Original image data not found.');
        }
    }

    public async updateFeatured(imageId: number, featured: boolean): Promise<ItemImage> {
        const data = {
            featured
        } as ItemImageUpdateRequest;
        return await this.itemImageRepo.update(imageId, data);
    }

    public async destroy(id: number): Promise<void> {
        const itemImage: resources.ItemImage = await this.findOne(id, true).then(value => value.toJSON());
        this.log.debug('destroy(), remove image, hash: ', itemImage.hash);

        // find and remove ItemImageDatas and files
        for (const imageData of itemImage.ItemImageDatas) {
            await this.itemImageDataService.destroy(imageData.id);
        }

        await this.itemImageRepo.destroy(id);
    }
}
