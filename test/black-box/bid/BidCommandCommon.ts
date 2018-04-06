import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';

// TODO: get rid of this, its not easily reusable because it cannot be find
// for test data, use/create test data from the testdata folder so it can be
// shared across tests or use testdataservice to generate testdata

// Ryno hack
export const testDataListingItemTemplate = {
    market_id: 0,
    hash: 'hash1',
    itemInformation: {
        title: 'item title1',
        shortDescription: 'item short desc1',
        longDescription: 'item long desc1',
        itemCategory: {
            key: 'cat_high_luxyry_items'
        },
        itemLocation: {
            region: 'South Africa',
            address: 'asdf, asdf, asdf',
            locationMarker: {
                markerTitle: 'Helsinki',
                markerText: 'Helsinki',
                lat: 12.1234,
                lng: 23.2314
            }
        },
        shippingDestinations: [{
            country: 'United Kingdom',
            shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
        }, {
            country: 'China',
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: 'South Africa',
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
            currency: Currency.PARTICL,
            basePrice: 0.0101,
            shippingPrice: {
                domestic: 0.123,
                international: 1.234
            },
            cryptocurrencyAddress: {
                type: CryptocurrencyAddressType.NORMAL,
                address: '1234'
            }
        }
    },
    messagingInformation: [{
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    }]
};

export const addressTestData = {
    title: 'Work',
    firstName: 'David',
    lastName: 'Hoffman',
    addressLine1: '123 6th St',
    addressLine2: 'Melbourne FL 32904',
    city: 'Melbourne',
    state: 'Mel State',
    country: 'FI',
    zipCode: '85001'
};
// End - Ryno Hack
