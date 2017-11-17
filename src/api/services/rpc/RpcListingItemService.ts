import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { ListingItemService } from '../ListingItemService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import * as Bookshelf from 'bookshelf';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';
import * as crypto from 'crypto-js';
import { Country } from '../../enums/Country';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../enums/ImageDataProtocolType';
import { PaymentType } from '../../enums/PaymentType';
import { EscrowType } from '../../enums/EscrowType';
import { Currency } from '../../enums/Currency';
import { CryptocurrencyAddressType } from '../../enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../enums/MessagingProtocolType';

export class RpcListingItemService {

    public log: LoggerType;

        constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async findAll(@request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return await this.listingItemService.findAll();
    }

    /**
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async findByCategory(@request(RpcRequest) data: any): Promise<any> {
        const listingItems = await this.listingItemService.findByCategory(data.params[0]);
        // this.log.debug('listingItems:', listingItems.toJSON());
        listingItems.toJSON().forEach(item => {
            this.log.debug('item:', item.ItemInformation.title);
        });
        return listingItems;
    }

    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findOne(@request(RpcRequest) data: any): Promise<ListingItem> {

        let listingItem;

        if (typeof data.params[0] === 'number') {
            listingItem = await this.listingItemService.findOne(data.params[0]);
        } else {
            listingItem = await this.listingItemService.findOneByHash(data.params[0]);
        }

        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        }
        return listingItem;
    }

    /**
     * data.params[]:
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: searchString, string, can be null
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async search( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ListingItem>> {
        return this.listingItemService.search({
            page: data.params[0] || 1,
            pageLimit: data.params[1] || 5,
            order: data.params[2] || 'ASC',
            category: data.params[3],
            searchString: data.params[4] || ''
        } as ListingItemSearchParams, data.params[5]);
    }

    /**
     * THIS IS JUST FOR TESTING PURPOSES...
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async create(@request(RpcRequest) data: any): Promise<ListingItem> {
        const hash = crypto.SHA256(new Date().getTime().toString()).toString();
        return this.listingItemService.create({
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

    /**
     * THIS IS JUST FOR TESTING PURPOSES...
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async update(@request(RpcRequest) data: any): Promise<ListingItem> {
        return this.listingItemService.update(data.params[0], {
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

    /**
     * THIS IS JUST FOR TESTING PURPOSES...
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async destroy(@request(RpcRequest) data: any): Promise<void> {
        return this.listingItemService.destroy(data.params[0]);
    }

}
