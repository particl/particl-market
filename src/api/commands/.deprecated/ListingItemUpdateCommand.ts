import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import {RpcCommand} from '../RpcCommand';
import { Country } from '../../enums/Country';
import { ShippingAvailability } from '../../enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../enums/ImageDataProtocolType';
import { PaymentType } from '../../enums/PaymentType';
import { EscrowType } from '../../enums/EscrowType';
import { Currency } from '../../enums/Currency';
import { CryptocurrencyAddressType } from '../../enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../enums/MessagingProtocolType';

export class ListingItemUpdateCommand implements RpcCommand<ListingItem> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'listingitem.update';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ListingItem> {
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

    public help(): string {
        return 'ListingItemUpdateCommand: TODO: Fill in help string.';
    }
}
