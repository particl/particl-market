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
import { ItemImageService } from './ItemImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ItemCategoryService } from './ItemCategoryService';
import { ItemCategory } from '../../models/ItemCategory';
import { ItemCategoryCreateRequest } from '../../requests/model/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from '../../requests/model/ItemLocationCreateRequest';
import { ShippingDestinationCreateRequest } from '../../requests/model/ShippingDestinationCreateRequest';
import { ItemImageCreateRequest } from '../../requests/model/ItemImageCreateRequest';

export class ItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) public itemImageService: ItemImageService,
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

        this.log.debug('create(), body: ', JSON.stringify(body, null, 2));

        // ItemInformation needs to be related to either one
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        const itemCategory: ItemCategoryCreateRequest | ItemCategoryUpdateRequest = body.itemCategory;
        const itemLocation: ItemLocationCreateRequest = body.itemLocation;
        const shippingDestinations: ShippingDestinationCreateRequest[] = body.shippingDestinations || [];
        const itemImages: ItemImageCreateRequest[] = body.itemImages || [];

        delete body.itemCategory;
        delete body.itemLocation;
        delete body.shippingDestinations;
        delete body.itemImages;

        if (!_.isEmpty(itemCategory)) {
            // get existing ItemCategory or create new one
            const existingItemCategory: resources.ItemCategory = await this.getOrCreateItemCategory(itemCategory).then(value => value.toJSON());
            body.item_category_id = existingItemCategory.id;
        }

        // ready to save, if the request body was valid, create the itemInformation
        const itemInformation: resources.ItemInformation = await this.itemInformationRepo.create(body).then(value => value.toJSON());

        // this.log.debug('itemInformation: ', JSON.stringify(itemInformation, null, 2));

        // create related models
        if (!_.isEmpty(itemLocation)) {
            itemLocation.item_information_id = itemInformation.id;
            // this.log.debug('itemLocation: ', JSON.stringify(itemLocation, null, 2));
            await this.itemLocationService.create(itemLocation);
        }

        if (!_.isEmpty(shippingDestinations)) {
            for (const shippingDestination of shippingDestinations) {
                shippingDestination.item_information_id = itemInformation.id;
                // this.log.debug('shippingDestination: ', JSON.stringify(shippingDestination, null, 2));
                await this.shippingDestinationService.create(shippingDestination);
            }
        }

        if (!_.isEmpty(itemImages)) {
            for (const itemImage of itemImages) {
                itemImage.item_information_id = itemInformation.id;
                // this.log.debug('itemImage: ', JSON.stringify(itemImage, null, 2));
                await this.itemImageService.create(itemImage);
            }
        }

        // finally find and return the created itemInformation
        return await this.findOne(itemInformation.id);
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) data: ItemInformationUpdateRequest): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));
        this.log.debug('update(), body: ', JSON.stringify(body, null, 2));

        // find the existing one without related
        const itemInformation = await this.findOne(id, false);

        // set new values
        itemInformation.Title = body.title;
        itemInformation.ShortDescription = body.shortDescription;
        itemInformation.LongDescription = body.longDescription;
        const itemInfoToSave = itemInformation.toJSON();

        if (!itemInfoToSave.item_category_id && !_.isEmpty(body.itemCategory)) {
            // get existing ItemCategory or create new one
            const existingItemCategory = await this.getOrCreateItemCategory(body.itemCategory);
            itemInfoToSave.item_category_id = existingItemCategory.Id;
        }

        // update itemInformation record
        const updatedItemInformation = await this.itemInformationRepo.update(id, itemInfoToSave);

        if (body.itemLocation) {
            // this.log.debug('update(), body.itemLocation: ', JSON.stringify(body.itemLocation, null, 2));

            // find related record and delete it
            let itemLocation = updatedItemInformation.related('ItemLocation').toJSON();
            await this.itemLocationService.destroy(itemLocation.id);
            // recreate related data
            itemLocation = body.itemLocation;
            itemLocation.item_information_id = id;
            await this.itemLocationService.create(itemLocation);
        }

        // todo: instead of delete and create, update

        // find related records and delete
        let shippingDestinations = updatedItemInformation.related('ShippingDestinations').toJSON();
        for (const shippingDestination of shippingDestinations) {
            await this.shippingDestinationService.destroy(shippingDestination.id);
        }

        // recreate related data
        shippingDestinations = body.shippingDestinations || [];
        if (!_.isEmpty(shippingDestinations)) {
            for (const shippingDestination of shippingDestinations) {
                shippingDestination.item_information_id = id;
                // this.log.debug('update(), shippingDestination: ', JSON.stringify(shippingDestination, null, 2));
                await this.shippingDestinationService.create(shippingDestination);
            }
        }

        // find related records and delete
        let itemImages = updatedItemInformation.related('ItemImages').toJSON();
        for (const itemImage of itemImages) {
            await this.itemImageService.destroy(itemImage.id);
        }

        // recreate related data
        itemImages = body.itemImages || [];
        if (!_.isEmpty(itemImages)) {
            for (const itemImage of itemImages) {
                itemImage.item_information_id = itemInformation.id;
                // this.log.debug('itemImage: ', JSON.stringify(itemImage, null, 2));
                await this.itemImageService.create(itemImage);
            }
        }

        // finally find and return the updated itemInformation
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        const itemInformation: resources.ItemInformation = await this.findOne(id, true).then(value => value.toJSON());
        for (const image of itemInformation.ItemImages) {
            // this.log.debug('image: ', JSON.stringify(image, null,  2));
            await this.itemImageService.destroy(image.id);
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

        // if (createRequest.id) {
        //    result = await this.itemCategoryService.findOneDefaultByKey(createRequest.id);
        // }
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
