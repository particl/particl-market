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
import { ValidationException } from '../../exceptions/ValidationException';
import { ItemInformationRepository } from '../../repositories/ItemInformationRepository';
import { ItemInformation } from '../../models/ItemInformation';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../../requests/model/ItemInformationUpdateRequest';
import { ItemLocationService } from './ItemLocationService';
import { ImageService } from './ImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ItemCategoryService } from './ItemCategoryService';
import { ItemCategory } from '../../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../../requests/model/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from '../../requests/model/ItemLocationCreateRequest';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ImageCreateRequest } from '../../requests/model/ImageCreateRequest';


export class ItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.model.ShippingDestinationService) public shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.model.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Repository) @named(Targets.Repository.ItemInformationRepository) public itemInformationRepo: ItemInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.itemInformationRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemInformation> {
        const itemInformation = await this.itemInformationRepo.findOne(id, withRelated);
        if (itemInformation === null) {
            this.log.warn(`ItemInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemInformation;
    }

    public async findByListingItemTemplateId(listingItemTemplateId: number, withRelated: boolean = true): Promise<ItemInformation> {
        const itemInformation = await this.itemInformationRepo.findByItemTemplateId(listingItemTemplateId, withRelated);
        if (itemInformation === null) {
            this.log.warn(`ItemInformation with the listingItemTemplateId=${listingItemTemplateId} was not found!`);
            throw new NotFoundException(listingItemTemplateId);
        }
        return itemInformation;
    }

    @validate()
    public async create( @request(ItemInformationCreateRequest) data: ItemInformationCreateRequest): Promise<ItemInformation> {
        const body: ItemInformationCreateRequest = JSON.parse(JSON.stringify(data));

        // this.log.debug('create(), body: ', JSON.stringify(body, null, 2));

        // ItemInformation needs to be related to either one
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        // body.item_category_id might also exist
        const itemCategory: ItemCategoryCreateRequest | ItemCategoryUpdateRequest = body.itemCategory;
        const itemLocation: ItemLocationCreateRequest = body.itemLocation || {};
        const shippingDestinations: ShippingDestinationCreateRequest[] = body.shippingDestinations || [];
        const images: ImageCreateRequest[] = body.images || [];

        delete body.itemCategory;
        delete body.itemLocation;
        delete body.shippingDestinations;
        delete body.images;

        if (!_.isEmpty(itemCategory)) {
            // get existing ItemCategory or create new one
            const existingItemCategory: resources.ItemCategory = await this.getOrCreateItemCategory(itemCategory).then(value => value.toJSON());
            body.item_category_id = existingItemCategory.id;
        }

        // ready to save, if the request body was valid, create the itemInformation
        const itemInformation: resources.ItemInformation = await this.itemInformationRepo.create(body).then(value => value.toJSON());

        if (!_.isEmpty(itemLocation)) {
            itemLocation.item_information_id = itemInformation.id;
            await this.itemLocationService.create(itemLocation);
        }

        if (!_.isEmpty(shippingDestinations)) {
            for (const shippingDestination of shippingDestinations) {
                shippingDestination.item_information_id = itemInformation.id;
                // this.log.debug('shippingDestination: ', JSON.stringify(shippingDestination, null, 2));
                await this.shippingDestinationService.create(shippingDestination);
            }
        }

        if (!_.isEmpty(images)) {
            for (const image of images) {
                image.item_information_id = itemInformation.id;
                // this.log.debug('create(), image: ', JSON.stringify(image, null, 2));
                await this.imageService.create(image);
            }
        }

        // finally find and return the created itemInformation
        return await this.findOne(itemInformation.id);
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) data: ItemInformationUpdateRequest): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('update(), body: ', JSON.stringify(body, null, 2));

        // find the existing one without related
        const itemInformation = await this.findOne(id, false);

        // set new values
        itemInformation.Title = body.title;
        itemInformation.ShortDescription = body.shortDescription;
        itemInformation.LongDescription = body.longDescription;

        // const itemInfoToSave = itemInformation.toJSON();

        if (!_.isEmpty(body.itemCategory)) {
            const existingItemCategory: resources.ItemCategory = await this.getOrCreateItemCategory(body.itemCategory).then(value => value.toJSON());
            itemInformation.set('itemCategoryId', existingItemCategory.id);
        }

        // update itemInformation record
        const updatedItemInformation = await this.itemInformationRepo.update(id, itemInformation.toJSON());

        if (body.itemLocation) {
            // find related and delete
            const itemLocation: resources.ItemLocation = updatedItemInformation.related('ItemLocation').toJSON() || {} as resources.ItemLocation;

            if (!_.isEmpty(itemLocation)) {
                await this.itemLocationService.destroy(itemLocation.id);
            }

            // then create
            const createRequest: ItemLocationCreateRequest = body.itemLocation;
            createRequest.item_information_id = id;
            await this.itemLocationService.create(createRequest);
        }

        // update only if new data was passed
        if (!_.isEmpty(body.shippingDestinations)) {

            // find related and delete
            const shippingDestinations: resources.ShippingDestination[] = updatedItemInformation.related('ShippingDestinations').toJSON()
                || [] as resources.ShippingDestination[];
            if (!_.isEmpty(shippingDestinations)) {
                for (const shippingDestination of shippingDestinations) {
                    await this.shippingDestinationService.destroy(shippingDestination.id);
                }
            }

            // then create
            if (!_.isEmpty(body.shippingDestinations)) {
                for (const createRequest of body.shippingDestinations) {
                    createRequest.item_information_id = id;
                    await this.shippingDestinationService.create(createRequest);
                }
            }
        }

        // this.log.debug('update(), body.images: ', JSON.stringify(body.images, null, 2));

        // update only if new data was passed
        if (!_.isEmpty(body.images)) {

            // find related and delete
            const images = updatedItemInformation.related('Images').toJSON() || [] as resources.Image[];
            if (!_.isEmpty(images)) {
                for (const image of images) {
                    await this.imageService.destroy(image.id);
                }
            }

            // then create
            if (!_.isEmpty(body.images)) {
                for (const createRequest of body.images) {
                    createRequest.item_information_id = itemInformation.id;
                    // this.log.debug('image, createRequest: ', JSON.stringify(createRequest, null, 2));
                    await this.imageService.create(createRequest);
                }
            }
        }

        // finally find and return the updated itemInformation
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        const itemInformation: resources.ItemInformation = await this.findOne(id, true).then(value => value.toJSON());
        for (const image of itemInformation.Images) {
            // this.log.debug('image: ', JSON.stringify(image, null,  2));
            await this.imageService.destroy(image.id);
        }
        await this.itemInformationRepo.destroy(id);
    }

    /**
     * fetch or create the given ItemCategory from db
     * @returns {Promise<ItemCategory>}
     * @param createRequest
     */
    private async getOrCreateItemCategory(createRequest: ItemCategoryCreateRequest): Promise<ItemCategory> {
        let result;
        // this.log.debug('getOrCreateItemCategory(): ', JSON.stringify(createRequest, null, 2));

        if (createRequest.key && createRequest.market) {
            result = await this.itemCategoryService.findOneByKeyAndMarket(createRequest.key, createRequest.market);
        } else if (createRequest.key) {
            result = await this.itemCategoryService.findOneDefaultByKey(createRequest.key);
        } else {
            result = await this.itemCategoryService.create(createRequest);
        }
        return result;
    }
}
