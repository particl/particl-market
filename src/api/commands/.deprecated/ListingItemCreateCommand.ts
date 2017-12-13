import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ListingItemService } from '../services/ListingItemService';
import { RpcRequest } from '../requests/RpcRequest';
import { ListingItem } from '../models/ListingItem';
import {RpcCommand} from './RpcCommand';
import * as crypto from 'crypto-js';
import { Country } from '../enums/Country';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';
import { Currency } from '../enums/Currency';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../enums/MessagingProtocolType';

export class ListingItemCreateCommand implements RpcCommand<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'listingitem.create';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItem> {
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

    public help(): string {
        return 'ListingItemCreateCommand: TODO: Fill in help string.';
    }
}
