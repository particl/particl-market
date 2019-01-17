// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemImageRepository } from '../repositories/ItemImageRepository';
import { ItemImage } from '../models/ItemImage';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ItemImageUpdateRequest } from '../requests/ItemImageUpdateRequest';
import { ItemImageDataService } from './ItemImageDataService';
import { ImageFactory } from '../factories/ImageFactory';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';
import { MessageException } from '../exceptions/MessageException';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { HashableObjectType } from '../enums/HashableObjectType';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';


export class ItemImageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) public itemImageDataService: ItemImageDataService,
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

        const itemImageDataCreateRequest = {
            protocol: ImageDataProtocolType.LOCAL,
            encoding: 'BASE64',
            data: dataStr,
            dataId: imageFile.fieldname, // replaced with local url in factory
            imageVersion: ImageVersions.ORIGINAL.propName,
            originalMime: imageFile.mimetype,
            originalName: imageFile.originalname
        } as ItemImageDataCreateRequest;

        const itemImageCreateRequest = {
            item_information_id: itemInformationId,
            datas: [itemImageDataCreateRequest]
        } as ItemImageCreateRequest;

        return await this.create(itemImageCreateRequest);
    }

    /**
     * creates multiple different version of given image
     *
     * @param data
     */
    @validate()
    public async create( @request(ItemImageCreateRequest) data: ItemImageCreateRequest): Promise<ItemImage> {

        const startTime = new Date().getTime();
        const body = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        // get the existing ItemImageDatas
        const itemImageDatas: ItemImageDataCreateRequest[] = body.datas;
        // get the original out of those
        const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        // remove ItemImageDatas from the body
        delete body.datas;

        if (itemImageDataOriginal) { // the original should always exist, its used to create the other versions

            // use the original image version to create a hash for the ItemImage
            body.hash = ObjectHash.getHash(itemImageDataOriginal, HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST);

            // get all protocols
            const protocols = Object.keys(ImageDataProtocolType).map(key => (ImageDataProtocolType[key]));

            if (_.isEmpty(itemImageDataOriginal.protocol) ||  protocols.indexOf(itemImageDataOriginal.protocol) === -1) {
                this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                throw new MessageException('Invalid image protocol.');
            }

            if (_.isEmpty(itemImageDataOriginal.data)) {
                throw new MessageException('Image data not found.');
            }

            // create the ItemImage
            const itemImage = await this.itemImageRepo.create(body);

            // then create the other imageDatas from the given original data,
            // original is automatically added as one of the versions
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            const imageDatas: ItemImageDataCreateRequest[] = await this.imageFactory.getImageDatas(
                itemImage.Id, itemImage.Hash, itemImageDataOriginal, toVersions);

            // save all ItemImageDatas
            for (const imageData of imageDatas) {
                // const fileName = await this.itemImageDataService.saveImageFile(imageData.data, body.hash, imageData.imageVersion);
                // imageData.data = fileName;

                await this.itemImageDataService.create(imageData);
            }

            // finally find and return the created itemImage
            const newItemImage = await this.findOne(itemImage.Id);
            // this.log.debug('saved image:', JSON.stringify(newItemImage.toJSON(), null, 2));

            this.log.debug('itemImageService.create: ' + (new Date().getTime() - startTime) + 'ms');
            return newItemImage;
        } else {
            throw new MessageException('Original image data not found.');
        }
    }

    @validate()
    public async update(id: number, @request(ItemImageUpdateRequest) data: ItemImageUpdateRequest): Promise<ItemImage> {

        const startTime = new Date().getTime();
        const body = JSON.parse(JSON.stringify(data));

        // grab the existing imagedatas
        const itemImageDatas: ItemImageDataCreateRequest[] = body.datas;
        // get the original out of those
        const itemImageDataOriginal = _.find(itemImageDatas, (imageData) => {
            return imageData.imageVersion === ImageVersions.ORIGINAL.propName;
        });

        delete body.datas;

        const itemImage = await this.findOne(id, false);

        if (itemImageDataOriginal) {

            // use the original image version to create a hash for the ItemImage
            body.hash = ObjectHash.getHash(itemImageDataOriginal, HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST);

            // get all protocols
            const protocols = Object.keys(ImageDataProtocolType).map(key => (ImageDataProtocolType[key]));

            if (_.isEmpty(itemImageDataOriginal.protocol) || protocols.indexOf(itemImageDataOriginal.protocol) === -1) {
                this.log.warn(`Invalid protocol <${itemImageDataOriginal.protocol}> encountered.`);
                throw new MessageException('Invalid image protocol.');
            }

            if (_.isEmpty(itemImageDataOriginal.data)) {
                throw new MessageException('Image data not found.');
            }

            // set new values
            itemImage.Hash = body.hash;

            // update itemImage record
            const updatedItemImageModel = await this.itemImageRepo.update(id, itemImage.toJSON());
            const updatedItemImage: resources.ItemImage = updatedItemImageModel.toJSON();

            // find and remove old related ItemImageDatas and files
            for (const imageData of updatedItemImage.ItemImageDatas) {
                await this.itemImageDataService.destroy(imageData.id);
            }

            // then recreate the other imageDatas from the given original data
            const toVersions = [ImageVersions.LARGE, ImageVersions.MEDIUM, ImageVersions.THUMBNAIL];
            const imageDatas: ItemImageDataCreateRequest[] = await this.imageFactory.getImageDatas(
                itemImage.Id, itemImage.Hash, itemImageDataOriginal, toVersions);

            // save all ItemImageDatas
            for (const imageData of imageDatas) {
                // const fileName = await this.itemImageDataService.saveImageFile(imageData.data, body.hash, imageData.imageVersion);
                // imageData.data = fileName;

                this.log.debug('imageData: ', JSON.stringify(imageData, null, 2));
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

    public async updateFeaturedImage(templateID: number, imageId: number): Promise<ItemImage> {
        let returnUpdate: any;
        // get all templates errors if not found
        const allTemplates = await this.findAll()
        .then(value => {
            return value.toJSON();
        });
        // findOne throws if not found
        const itemImage = await this.findOne(templateID)
        .then(value => {
            return value.toJSON();
        });
        if (itemImage.itemInformationId !== imageId) {
            throw new MessageException('Image ID not found on template!');
        }
        if (allTemplates) {
            // loop through templates to check for previous featured images, sets to false
            for (const item of allTemplates) {
                if (item.itemInformationId === templateID && item.featuredImg === 1) {
                    const data = {
                        id: item.id,
                        featured_img: false
                    };
                    await this.itemImageRepo.update(templateID, data);
                }
            }
        }
        // sets the featured image
        if (itemImage) {
            const data = {
                id: imageId,
                featured_img: true
            };
            returnUpdate = await this.itemImageRepo.update(templateID, data);
        }
        return returnUpdate;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageRepo.destroy(id);
    }
}
