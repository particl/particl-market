import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import * as crypto from 'crypto-js';
import { ListingItemRepository } from '../repositories/ListingItemRepository';
import { ListingItem } from '../models/ListingItem';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemUpdateRequest } from '../requests/ListingItemUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { Country } from '../enums/Country';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';
import { Currency } from '../enums/Currency';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../enums/MessagingProtocolType';
import { MessagingInformationService } from './MessagingInformationService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemInformationService } from './ItemInformationService';

export class ListingItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) public itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) public messagingInformationService: MessagingInformationService,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemRepository) public listingItemRepo: ListingItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemRepo.findAll();
    }

    @validate()
    public async rpcFindByCategory( @request(RpcRequest) data: any): Promise<any> {
        const listingItems = await this.findByCategory(data.params[0]);
        // this.log.debug('listingItems:', listingItems.toJSON());
        listingItems.toJSON().forEach( item => {
            this.log.debug('item:', item.ItemInformation.title);
        });
        return listingItems;
    }

    public async findByCategory( categoryId: number ): Promise<Bookshelf.Collection<ListingItem>> {
        this.log.debug('find by category:', categoryId);
        return this.listingItemRepo.findByCategory(categoryId);
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ListingItem> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOne(id, withRelated);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItem;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ListingItem> {
        const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        return this.create({
            hash,
            itemInformation: {
                title: 'item title1',
                shortDescription: 'item short desc1',
                longDescription: 'item long desc1',
                itemCategory: {
                    key: 'cat_TESTROOT',
                    name: 'TESTROOT',
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
            },
            paymentInformation: {
                type: PaymentType.SALE,
                escrow: {
                    type: EscrowType.MAD,
                    ratio: {
                        buyer: 100,
                        seller: 100
                    }
                },
                itemPrice: {
                    currency: Currency.BITCOIN,
                    basePrice: 0.0001,
                    shippingPrice: {
                        domestic: 0.123,
                        international: 1.234
                    },
                    address: {
                        type: CryptocurrencyAddressType.NORMAL,
                        address: '1234'
                    }
                }
            },
            messagingInformation: {
                protocol: MessagingProtocolType.SMSG,
                publicKey: 'publickey1'
            }
            // TODO: ignoring listingitemobjects for now
        });
    }

    @validate()
    public async create( @request(ListingItemCreateRequest) body: any): Promise<ListingItem> {

        // extract and remove related models from request
        const itemInformation = body.itemInformation;
        delete body.itemInformation;
        const paymentInformation = body.paymentInformation;
        delete body.paymentInformation;
        const messagingInformation = body.messagingInformation;
        delete body.messagingInformation;

        this.log.debug('body: ', body);
        // If the request body was valid we will create the listingItem
        const listingItem = await this.listingItemRepo.create(body);

        // create related models
        itemInformation.listing_item_id = listingItem.Id;
        await this.itemInformationService.create(itemInformation);
        paymentInformation.listing_item_id = listingItem.Id;
        await this.paymentInformationService.create(paymentInformation);
        messagingInformation.listing_item_id = listingItem.Id;
        await this.messagingInformationService.create(messagingInformation);

        // finally find and return the created listingItem
        const newListingItem = await this.findOne(listingItem.Id);
        return newListingItem;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ListingItem> {
        return this.update(data.params[0], {
            hash: 'abc',
            itemInformation: {
                title: 'title UPDATED',
                shortDescription: 'item UPDATED',
                longDescription: 'item UPDATED',
                itemCategory: {
                    key: 'cat_TESTROOT'
                },
                itemLocation: {
                    region: Country.FINLAND,
                    address: 'asdf UPDATED',
                    locationMarker: {
                        markerTitle: 'UPDATED',
                        markerText: 'UPDATED',
                        lat: 33.333,
                        lng: 44.333
                    }
                },
                shippingDestinations: [{
                    country: Country.EU,
                    shippingAvailability: ShippingAvailability.SHIPS
                }],
                itemImages: [{
                    hash: 'imagehash1 UPDATED',
                    data: {
                        dataId: 'dataid1 UPDATED',
                        protocol: ImageDataProtocolType.IPFS,
                        encoding: null,
                        data: null
                    }
                }]
            },
            paymentInformation: {
                type: PaymentType.FREE,
                escrow: {
                    type: EscrowType.MAD,
                    ratio: {
                        buyer: 1,
                        seller: 1
                    }
                },
                itemPrice: {
                    currency: Currency.PARTICL,
                    basePrice: 3.333,
                    shippingPrice: {
                        domestic: 1.111,
                        international: 2.222
                    },
                    address: {
                        type: CryptocurrencyAddressType.STEALTH,
                        address: '1234 UPDATED'
                    }
                }
            },
            messagingInformation: {
                protocol: MessagingProtocolType.SMSG,
                publicKey: 'publickey1 UPDATED'
            }
            // TODO: ignoring listingitemobjects for now
        });
    }

    @validate()
    public async update(id: number, @request(ListingItemUpdateRequest) body: any): Promise<ListingItem> {

        // find the existing one without related
        const listingItem = await this.findOne(id, false);

        // set new values
        listingItem.Hash = body.hash;

        this.log.info('listingItem.toJSON():', listingItem.toJSON());
        // update listingItem record
        const updatedListingItem = await this.listingItemRepo.update(id, listingItem.toJSON());

        // find related record and delete it and recreate related data
        const itemInformation = updatedListingItem.related('ItemInformation').toJSON();
        await this.itemInformationService.destroy(itemInformation.id);
        body.itemInformation.listing_item_id = id;
        await this.itemInformationService.create(body.itemInformation);

        // find related record and delete it and recreate related data
        const paymentInformation = updatedListingItem.related('PaymentInformation').toJSON();
        await this.paymentInformationService.destroy(paymentInformation.id);
        body.paymentInformation.listing_item_id = id;
        await this.paymentInformationService.create(body.paymentInformation);

        // find related record and delete it and recreate related data
        const messagingInformation = updatedListingItem.related('MessagingInformation').toJSON();
        await this.messagingInformationService.destroy(messagingInformation.id);
        body.messagingInformation.listing_item_id = id;
        await this.messagingInformationService.create(body.messagingInformation);

        // finally find and return the updated listingItem
        const newListingItem = await this.findOne(id);
        return newListingItem;

    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemRepo.destroy(id);
    }

    /**
     * options: Object.
     * params: id, page, pageLimit, order.
     * Example: {id: options.params[0], page: options.params[1], pageLimit:
     * options.params[2], order: options.params[3]}
     */

    public async getListingItems(options: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemRepo.findAllItems({id: options.params[0] || 1, page: options.params[1] || 1 , pageLimit: options.params[2] || 5, order: options.params[3] || 'ASC'});
    }

    /** hash: It is a hash of the listing Item. */

    public async findOneByHash(hash: string): Promise<ListingItem> {
        const listingItem = await this.listingItemRepo.findOneByHash(hash);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return listingItem;
    }


    /**
     * options: Array.
     * params: categoryId, searchTerm, withRelated.
     * Example: [1, 'test', true]
     */

     public async searchByCategoryIdOrName(options: any): Promise<Bookshelf.Collection<ListingItem>> {
        const listingItem = await this.listingItemRepo.searchByCategoryIdOrName(options);
        if (listingItem === null) {
            this.log.warn(`ListingItem with the category=${options[0]} was not found!`);
            throw new NotFoundException(options[0]);
        }
        return listingItem;
    }

}
