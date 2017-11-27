import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemInformation } from '../../src/api/models/ItemInformation';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemInformationService } from '../../src/api/services/ItemInformationService';

describe('ItemInformation', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemInformationService: ItemInformationService;

    let createdId;

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

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await itemInformationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new item information', async () => {
        testData['listing_item_template_id'] = 0;
        const itemInformationModel: ItemInformation = await itemInformationService.create(testData);
        createdId = itemInformationModel.Id;

        const result = itemInformationModel.toJSON();

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

    test('Should throw ValidationException because we want to create a empty item information', async () => {
        expect.assertions(1);
        await itemInformationService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item informations with our new create one', async () => {
        const itemInformationCollection = await itemInformationService.findAll();
        const itemInformation = itemInformationCollection.toJSON();
        expect(itemInformation.length).toBe(1);

        const result = itemInformation[0];

        expect(result.title).toBe(testData.title);
        expect(result.shortDescription).toBe(testData.shortDescription);
        expect(result.longDescription).toBe(testData.longDescription);
        expect(result.ItemCategory).toBe(undefined); // doesnt fetch related
        expect(result.ItemLocation).toBe(undefined); // doesnt fetch related
        expect(result.ShippingDestinations).toBe(undefined); // doesnt fetch related
        expect(result.ItemImages).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item information', async () => {
        const itemInformationModel: ItemInformation = await itemInformationService.findOne(createdId);
        const result = itemInformationModel.toJSON();

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

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await itemInformationService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item information', async () => {
        testDataUpdated['listing_item_template_id'] = 0;
        const itemInformationModel: ItemInformation = await itemInformationService.update(createdId, testDataUpdated);
        const result = itemInformationModel.toJSON();

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

    test('Should delete the item information', async () => {
        expect.assertions(1);
        await itemInformationService.destroy(createdId);
        await itemInformationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
