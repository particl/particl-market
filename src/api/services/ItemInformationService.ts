import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { MessageException } from '../exceptions/MessageException';

import { ItemInformationRepository } from '../repositories/ItemInformationRepository';
import { ItemInformation } from '../models/ItemInformation';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { ItemLocationService } from './ItemLocationService';
import { ItemImageService } from './ItemImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ListingItemTemplateRepository } from '../repositories/ListingItemTemplateRepository';
import { ItemCategoryService } from './ItemCategoryService';
import { ItemCategoryUpdateRequest } from '../requests/ItemCategoryUpdateRequest';
import { ItemCategory } from '../models/ItemCategory';

export class ItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) public itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) public shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
        @inject(Types.Repository) @named(Targets.Repository.ItemInformationRepository) public itemInformationRepo: ItemInformationRepository,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemTemplateRepository) public listingItemTemplateRepository: ListingItemTemplateRepository,
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

    public async findByItemTemplateId(listingItemTemplateId: number, withRelated: boolean = true): Promise<ItemInformation> {
        const itemInformation = await this.itemInformationRepo.findByItemTemplateId(listingItemTemplateId, withRelated);
        if (itemInformation === null) {
            this.log.warn(`ItemInformation with the listingItemTemplateId=${listingItemTemplateId} was not found!`);
            throw new NotFoundException(listingItemTemplateId);
        }
        return itemInformation;
    }

    @validate()
    public async create( @request(ItemInformationCreateRequest) data: ItemInformationCreateRequest): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        // ItemInformation needs to be related to either one
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        const itemCategory = body.itemCategory;
        const itemLocation = body.itemLocation;
        const shippingDestinations = body.shippingDestinations || [];
        const itemImages = body.itemImages || [];
        delete body.itemCategory;
        delete body.itemLocation;
        delete body.shippingDestinations;
        delete body.itemImages;

        // get existing item category or create new one
        const existingItemCategory = await this.getOrCreateItemCategory(itemCategory);
        body.item_category_id = existingItemCategory.Id;

        // ready to save, if the request body was valid, create the itemInformation
        const itemInformation = await this.itemInformationRepo.create(body);

        // create related models
        if (!_.isEmpty(itemLocation)) {
            itemLocation.item_information_id = itemInformation.Id;
            await this.itemLocationService.create(itemLocation);
        }

        for (const shippingDestination of shippingDestinations) {
            shippingDestination.item_information_id = itemInformation.Id;
            await this.shippingDestinationService.create(shippingDestination);
        }

        for (const itemImage of itemImages) {
            itemImage.item_information_id = itemInformation.Id;
            await this.itemImageService.create(itemImage);
        }

        // finally find and return the created itemInformation
        return await this.findOne(itemInformation.Id);
    }

    public async updateWithCheckListingTemplate(@request(ItemInformationUpdateRequest) body: ItemInformationUpdateRequest): Promise<ItemInformation> {
        const listingItemTemplateId = body.listing_item_template_id;
        const listingItemTemplate = await this.listingItemTemplateRepository.findOne(listingItemTemplateId);
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON() || {};
        if (_.isEmpty(itemInformation)) {
            this.log.warn(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
            throw new MessageException(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
        }
        return this.update(itemInformation.id, body);
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) data: ItemInformationUpdateRequest): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('updating ItemInformation, body: ', JSON.stringify(body, null, 2));

        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // find the existing one without related
        const itemInformation = await this.findOne(id, false);

        // set new values
        itemInformation.Title = body.title;
        itemInformation.ShortDescription = body.shortDescription;
        itemInformation.LongDescription = body.longDescription;
        const itemInfoToSave = itemInformation.toJSON();

        // get existing item category or create new one
        const existingItemCategory = await this.getOrCreateItemCategory(body.itemCategory);
        itemInfoToSave.item_category_id = existingItemCategory.Id;

        // update itemInformation record
        const updatedItemInformation = await this.itemInformationRepo.update(id, itemInfoToSave);

        if (body.itemLocation) {
            // find related record and delete it
            let itemLocation = updatedItemInformation.related('ItemLocation').toJSON();
            await this.itemLocationService.destroy(itemLocation.id);
            // recreate related data
            itemLocation = body.itemLocation;
            itemLocation.item_information_id = id;
            await this.itemLocationService.create(itemLocation);
        }

        // todo: instead of delete and create, update

        // find related record and delete it
        let shippingDestinations = updatedItemInformation.related('ShippingDestinations').toJSON();
        for (const shippingDestination of shippingDestinations) {
            await this.shippingDestinationService.destroy(shippingDestination.id);
        }

        // recreate related data
        shippingDestinations = body.shippingDestinations || [];
        for (const shippingDestination of shippingDestinations) {
            shippingDestination.item_information_id = id;
            await this.shippingDestinationService.create(shippingDestination);
        }

        // find related record and delete it
        let itemImages = updatedItemInformation.related('ItemImages').toJSON() || [];
        for (const itemImage of itemImages) {
            await this.itemImageService.destroy(itemImage.id);
        }

        // recreate related data
        itemImages = body.itemImages || [];
        for (const itemImage of itemImages) {
            itemImage.item_information_id = id;
            await this.itemImageService.create(itemImage);
        }

        // finally find and return the updated itemInformation
        const newItemInformation = await this.findOne(id);
        return newItemInformation;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemInformationRepo.destroy(id);
    }

    /**
     * fetch or create the given ItemCategory from db
     * @param itemCategory
     * @returns {Promise<ItemCategory>}
     */
    private async getOrCreateItemCategory(itemCategory: ItemCategoryUpdateRequest): Promise<ItemCategory> {
        if (itemCategory.key) {
            return await this.itemCategoryService.findOneByKey(itemCategory.key);
        } else if (itemCategory.id) {
            return await this.itemCategoryService.findOne(itemCategory.id);
        } else {
            return await this.itemCategoryService.create(itemCategory);
        }
    }

}
