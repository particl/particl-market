import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemInformationRepository } from '../repositories/ItemInformationRepository';
import { ItemInformation } from '../models/ItemInformation';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../requests/ItemInformationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { Country } from '../enums/Country';
import { ItemLocationService } from './ItemLocationService';
import { ItemImageService } from './ItemImageService';
import { ShippingDestinationService } from './ShippingDestinationService';
import { ItemCategoryService } from './ItemCategoryService';
import { ItemCategory } from '../models/ItemCategory';

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

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemInformation>> {
        return this.itemInformationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.findOne(data.params[0]);
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
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.create({
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                name: 'item category name 1',
                description: 'item category description 1'
            },
            itemLocation: {
                region: Country.SOUTH_AFRICA,
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: Country.UNITED_KINGDOM,
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: Country.ASIA,
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: Country.SOUTH_AFRICA,
                shippingAvailability: ShippingAvailability.ASK
            }],
            itemImages: [{
                hash: 'imagehash1',
                data: {
                    dataId: 'dataid1',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }, {
                hash: 'imagehash2',
                data: {
                    dataId: 'dataid2',
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: 'BASE64 encoded image data'
                }
            }, {
                hash: 'imagehash3',
                data: {
                    dataId: 'dataid3',
                    protocol: ImageDataProtocolType.SMSG,
                    encoding: null,
                    data: 'smsgdata'
                }
            }]
        });
    }

    @validate()
    public async create( @request(ItemInformationCreateRequest) body: any): Promise<ItemInformation> {

        // extract and remove related models from request
        const itemCategory = body.itemCategory;
        delete body.itemCategory;

        const itemLocation = body.itemLocation;
        delete body.itemLocation;
        const shippingDestinations = body.shippingDestinations;
        delete body.shippingDestinations;
        const itemImages = body.itemImages;
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
        itemLocation.item_information_id = itemInformation.Id;
        await this.itemLocationService.create(itemLocation);

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
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemInformation> {
        return this.update(data.params[0], {
            title: 'item title1 UPDATED',
            shortDescription: 'item short desc1 UPDATED',
            longDescription: 'item long desc1 UPDATED',
            itemCategory: {
                name: 'item category name 2',
                description: 'item category description 2'
            },
            itemLocation: {
                region: Country.FINLAND,
                address: 'asdf, UPDATED',
                locationMarker: {
                    markerTitle: 'Helsinki UPDATED',
                    markerText: 'Helsinki UPDATED',
                    lat: 3.234,
                    lng: 23.4
                }
            },
            shippingDestinations: [{
                country: Country.UNITED_KINGDOM,
                shippingAvailability: ShippingAvailability.SHIPS
            }],
            itemImages: [{
                hash: 'imagehash1',
                data: {
                    dataId: 'dataid1',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }]
        });
    }

    @validate()
    public async update(id: number, @request(ItemInformationUpdateRequest) body: any): Promise<ItemInformation> {

        // find the existing one without related
        const itemInformation = await this.findOne(id, false);

        // set new values
        itemInformation.Title = body.title;
        itemInformation.ShortDescription = body.shortDescription;
        itemInformation.LongDescription = body.longDescription;

        // check if item category allready exists
        let existingItemCategory;
        if (body.itemCategory.key) {
            existingItemCategory = await this.itemCategoryService.findOneByKey(body.itemCategory.key);
        } else if (body.itemCategory.id) {
            existingItemCategory = await this.itemCategoryService.findOne(body.itemCategory.id);
        } else {
            existingItemCategory = await this.itemCategoryService.create(body.itemCategory);
        }

        const itemInfoToSave = itemInformation.toJSON();
        itemInfoToSave['itemCategoryId'] = existingItemCategory.Id;

        // update itemInformation record
        const updatedItemInformation = await this.itemInformationRepo.update(id, itemInfoToSave);

        // find related record and delete it
        let itemLocation = updatedItemInformation.related('ItemLocation').toJSON();
        await this.itemLocationService.destroy(itemLocation.id);

        // recreate related data
        itemLocation = body.itemLocation;
        itemLocation.item_information_id = id;
        await this.itemLocationService.create(itemLocation);

        // find related record and delete it
        let shippingDestinations = updatedItemInformation.related('ShippingDestinations').toJSON();
        for (const shippingDestination of shippingDestinations) {
            await this.shippingDestinationService.destroy(shippingDestination.id);
        }

        // recreate related data
        shippingDestinations = body.shippingDestinations;
        for (const shippingDestination of shippingDestinations) {
            shippingDestination.item_information_id = id;
            await this.shippingDestinationService.create(shippingDestination);
        }

        // find related record and delete it
        let itemImages = updatedItemInformation.related('ItemImages').toJSON();
        for (const itemImage of itemImages) {
            await this.itemImageService.destroy(itemImage.id);
        }

        // recreate related data
        itemImages = body.itemImages;
        for (const itemImage of itemImages) {
            itemImage.item_information_id = id;
            await this.itemImageService.create(itemImage);
        }

        // finally find and return the updated itemInformation
        const newItemInformation = await this.findOne(id);
        return newItemInformation;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.itemInformationRepo.destroy(id);
    }

}
