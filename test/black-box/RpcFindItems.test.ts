import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

describe('/listing-items', () => {

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'  // , 'Related'
    ];

    const testData = {
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                name: 'ROOT',
                description: 'item category description 1',
                key: 'ROOT'
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
    };

    const testDataTwo = {
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                name: 'CHILD',
                description: 'item UPDATED',
                key: 'CHILD'
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
    };

    let createdId;
    let createdHash;
    let createdHashTwo;
    let createdCategory;
    let createdItemInformation;
    beforeAll(async () => {
        const command = new DatabaseResetCommand();
        await command.run();
    });


    test('Should list listing items with our new create one', async () => {
        const res = await api('POST', '/api/listing-items', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];
        createdHash = res.getData()['hash'];
        createdItemInformation = res.getData()['ItemInformation'];
        createdCategory = createdItemInformation.ItemCategory;

        // create second listing item
        const resTwo = await api('POST', '/api/listing-items', {
            body: testDataTwo
        });

    });

    test('Should get all listing items', async () => {
        const resMain = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [1, 2, 'ASC'],
                id: 1,
                jsonrpc: '2.0'
            }
        });

        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        createdHashTwo = resultMain[1].hash;
        expect(resultMain.length).toBe(2);
        expect(createdHash).toBe(resultMain[0].hash);
        expect(createdHashTwo).toBe(resultMain[1].hash);
    });

    test('Should get only first listing item by pagination', async () => {
        const resPageOne = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [1, 1, 'ASC'],
                id: 1,
                jsonrpc: '2.0'
            }

        });
        resPageOne.expectJson();
        resPageOne.expectStatusCode(200);
        resPageOne.expectDataRpc(keys);
        const resultPageOne: any = resPageOne.getBody()['result'];
        expect(resultPageOne.length).toBe(1);
        expect(createdHash).toBe(resultPageOne[0].hash);
    });

    test('Should get second listing item by pagination', async () => {
        const resPageTwo = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [2, 1, 'ASC'],
                id: 1,
                jsonrpc: '2.0'
            }

        });
        resPageTwo.expectJson();
        resPageTwo.expectStatusCode(200);
        resPageTwo.expectDataRpc(keys);
        const resultPageTwo: any = resPageTwo.getBody()['result'];
        expect(resultPageTwo.length).toBe(1);
        expect(createdHashTwo).toBe(resultPageTwo[0].hash);
    });

    test('Should return empty listing items array if invalid pagination', async () => {
        const resEmpty = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [2, 2, 'ASC'],
                id: 1,
                jsonrpc: '2.0'
            }

        });

        resEmpty.expectJson();
        resEmpty.expectStatusCode(200);
        const emptyListingResults: any = resEmpty.getBody()['result'];
        expect(emptyListingResults.length).toBe(0);
    });

    test('Should search listing items by category key', async () => {
        const resByCategoryName = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [1, 2, 'ASC', createdCategory.key, '', true],
                id: 1,
                jsonrpc: '2.0'
            }

        });
        resByCategoryName.expectJson();
        resByCategoryName.expectStatusCode(200);
        const listingCategoryResults: any = resByCategoryName.getBody()['result'];
        const category = listingCategoryResults[0].ItemInformation.ItemCategory;
        expect(listingCategoryResults.length).toBe(1);
        expect(createdCategory.key).toBe(category.key);

    });

    test('Should search listing items by category id', async () => {
        const resByCategoryId = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [1, 2, 'ASC', createdCategory.id, '', true],
                id: 1,
                jsonrpc: '2.0'
            }

        });
        resByCategoryId.expectJson();
        resByCategoryId.expectStatusCode(200);
        const listingCategoryByIdResults: any = resByCategoryId.getBody()['result'];

        const categoryById = listingCategoryByIdResults[0].ItemInformation.ItemCategory;
        expect(listingCategoryByIdResults.length).toBe(1);
        expect(createdCategory.id).toBe(categoryById.id);
    });


    test('Should search listing items by ItemInformation title', async () => {
        const resByCategoryByTitle = await api('POST', `/api/rpc`, {
            body: {
                method: 'finditems',
                params:  [1, 2, 'ASC', '', createdItemInformation.title, true],
                id: 1,
                jsonrpc: '2.0'
            }

        });
        resByCategoryByTitle.expectJson();
        resByCategoryByTitle.expectStatusCode(200);
        const listingCategoryByTitleResults: any = resByCategoryByTitle.getBody()['result'];

        const ItemInformation = listingCategoryByTitleResults[0].ItemInformation;
        expect(listingCategoryByTitleResults.length).toBe(1);
        expect(createdItemInformation.title).toBe(ItemInformation.title);
    });
});



