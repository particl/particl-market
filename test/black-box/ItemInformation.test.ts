import { api } from './lib/api';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { DatabaseSeedCommand } from '../../src/console/DatabaseSeedCommand';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

describe('/item-informations', () => {

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription' // , 'Related'
    ];

    // const keysWithoutRelated = [
    //    'id', 'updatedAt', 'createdAt', 'title', 'shortDescription', 'longDescription'
    // ];

    const testData = {
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
    };

    const testDataUpdated = {
        title: 'item title2',
        shortDescription: 'item short desc2',
        longDescription: 'item long desc2',
        itemCategory: {
            name: 'item category name 2',
            description: 'item category description 2'
        },

        itemLocation: {
            region: Country.EU,
            address: 'zxcv, zxcv, zxcv',
            locationMarker: {
                markerTitle: 'Stockholm',
                markerText: 'Stockholm',
                lat: 34.2314,
                lng: 11.1234
            }
        },
        shippingDestinations: [{
            country: Country.SWEDEN,
            shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
        }, {
            country: Country.EU,
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: Country.FINLAND,
            shippingAvailability: ShippingAvailability.ASK
        }],
        itemImages: [{
            hash: 'imagehash4',
            data: {
                dataId: 'dataid4',
                protocol: ImageDataProtocolType.IPFS,
                encoding: null,
                data: null
            }
        }, {
            hash: 'imagehash5',
            data: {
                dataId: 'dataid5',
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: 'BASE64 encoded image data'
            }
        }, {
            hash: 'imagehash6',
            data: {
                dataId: 'dataid6',
                protocol: ImageDataProtocolType.SMSG,
                encoding: null,
                data: 'smsgdata'
            }
        }]

    };

    let createdId;
    beforeAll(async () => {
        let command = new DatabaseResetCommand();
        await command.run();

        command = new DatabaseSeedCommand();
        await command.run();
    });

    test('POST      /item-informations        Should create a new item information', async () => {


        const res = await api('POST', '/api/item-informations', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.name).toBe(testData.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testData.itemCategory.description);
        expect(result.ItemLocation.region).toBe(testData.itemLocation.region);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testData.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(3);
    });

    test('POST      /item-informations        Should fail because we want to create a empty item information', async () => {
        const res = await api('POST', '/api/item-informations', {
            body: {}
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('GET       /item-informations        Should list item informations with our new create one', async () => {
        const res = await api('GET', '/api/item-informations');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);

        const result = data[0];
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory).toBe(undefined); // doesnt fetch related
        expect(result.ItemLocation).toBe(undefined); // doesnt fetch related
        expect(result.ShippingDestinations).toBe(undefined); // doesnt fetch related
        expect(result.ItemImages).toBe(undefined); // doesnt fetch related

    });

    test('GET       /item-informations/:id    Should return one item information', async () => {
        const res = await api('GET', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory.name).toBe(testData.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testData.itemCategory.description);
        expect(result.ItemLocation.region).toBe(testData.itemLocation.region);
        expect(result.ItemLocation.address).toBe(testData.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testData.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testData.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testData.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(3);

    });

    test('PUT       /item-informations/:id    Should update the item information', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.shortDescription).toBe(testDataUpdated.shortDescription);
        expect(result.longDescription).toBe(testDataUpdated.longDescription);
        expect(result.ItemCategory.name).toBe(testDataUpdated.itemCategory.name);
        expect(result.ItemCategory.description).toBe(testDataUpdated.itemCategory.description);
        expect(result.ItemLocation.region).toBe(testDataUpdated.itemLocation.region);
        expect(result.ItemLocation.address).toBe(testDataUpdated.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(3);
        expect(result.ItemImages).toHaveLength(3);

    });

    test('PUT       /item-informations/:id    Should fail because we want to update the item information with a invalid email', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: {
                email: 'abc'
            }
        });
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('DELETE    /item-informations/:id    Should delete the item information', async () => {
        const res = await api('DELETE', `/api/item-informations/${createdId}`);
        res.expectStatusCode(200);
    });

    /**
     * 404 - NotFound Testing
     */
    test('GET       /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('GET', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('DELETE    /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('DELETE', `/api/item-informations/${createdId}`);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('PUT       /item-informations/:id    Should return with a 404, because we just deleted the item information', async () => {
        const res = await api('PUT', `/api/item-informations/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(404);
    });

});
