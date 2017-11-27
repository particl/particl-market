import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { ValidationException } from '../exceptions/ValidationException';

import { ItemInformationRepository } from '../repositories/ItemInformationRepository';
import { ItemInformation } from '../models/ItemInformation';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { ItemLocationService } from './ItemLocationService';
import { ItemImageService } from './ItemImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ItemCategoryService } from './ItemCategoryService';

export class ItemInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) public itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) public shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) public itemLocationService: ItemLocationService,
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

    @validate()
    public async create( @request(ItemInformationCreateRequest) data: any): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));

        // todo: could this be annotated in ItemInformationUpdateRequest?
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        const itemCategory = body.itemCategory;
        delete body.itemCategory;

        const itemLocation = body.itemLocation || {};
        delete body.itemLocation;
        const shippingDestinations = body.shippingDestinations || [];
        delete body.shippingDestinations;
        const itemImages = body.itemImages || [];
        delete body.itemImages;

        // check if item category allready exists
        let existingItemCategory;
        if (itemCategory.key) {
            existingItemCategory = await this.itemCategoryService.findOneByKey(itemCategory.key);
        } else if (itemCategory.id) {
            existingItemCategory = await this.itemCategoryService.findOne(itemCategory.id);
        } else {
            existingItemCategory = await this.itemCategoryService.create(itemCategory);
        }

        body.item_category_id = existingItemCategory.Id;

        // If the request body was valid, create the itemInformation
        const itemInformation = await this.itemInformationRepo.create(body);

        // create related models
        if (itemLocation.region) {
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
        const newItemInformation = await this.findOne(itemInformation.Id);
        return newItemInformation;
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) data: any): Promise<ItemInformation> {

        const body = JSON.parse(JSON.stringify(data));

        // todo: could this be annotated in ItemInformationUpdateRequest?
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

        // check if item category allready exists
        let existingItemCategory;
        if (body.itemCategory.key) {
            existingItemCategory = await this.itemCategoryService.findOneByKey(body.itemCategory.key);
        } else if (body.itemCategory.id) {
            existingItemCategory = await this.itemCategoryService.findOne(body.itemCategory.id);
        } else {
            existingItemCategory = await this.itemCategoryService.create(body.itemCategory);
        }

        itemInfoToSave['itemCategoryId'] = existingItemCategory.Id;
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

}
