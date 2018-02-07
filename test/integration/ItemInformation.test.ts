import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemInformation } from '../../src/api/models/ItemInformation';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ItemInformationCreateRequest } from '../../src/api/requests/ItemInformationCreateRequest';
import { ItemInformationUpdateRequest } from '../../src/api/requests/ItemInformationUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import {CreatableModel} from '../../src/api/enums/CreatableModel';

describe('ItemInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemInformationService: ItemInformationService;
    let profileService: ProfileService;

    let createdId;
    let createdListingItemTemplate;
    let defaultProfile;

    const testData = {
        title: 'item title1',
        shortDescription: 'item short desc1',
        longDescription: 'item long desc1',
        itemCategory: {
            key: 'cat_apparel_adult',
            name: 'Adult',
            description: ''
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
            country: 'Asia',
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: 'South Africa',
            shippingAvailability: ShippingAvailability.ASK
        }],
        itemImages: [{
            hash: 'imagehash4',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcat
            }
        }, {
            hash: 'imagehash5',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcatTall
            }
        }, {
            hash: 'imagehash6',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcatWide
            }
        }]
    } as ItemInformationCreateRequest;

    const testDataUpdated = {
        title: 'item title2',
        shortDescription: 'item short desc2',
        longDescription: 'item long desc2',
        itemCategory: {
            key: 'cat_high_luxyry_items',
            name: 'Luxury Items',
            description: ''
        },
        itemLocation: {
            region: 'EU',
            address: 'zxcv, zxcv, zxcv',
            locationMarker: {
                markerTitle: 'Stockholm',
                markerText: 'Stockholm',
                lat: 34.2314,
                lng: 11.1234
            }
        },
        shippingDestinations: [{
            country: 'Sweden',
            shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
        }, {
            country: 'EU',
            shippingAvailability: ShippingAvailability.SHIPS
        }, {
            country: 'Finland',
            shippingAvailability: ShippingAvailability.ASK
        }],
        itemImages: [{
            hash: 'imagehash4',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcat
            }
        }, {
            hash: 'imagehash5',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcatTall
            }
        }, {
            hash: 'imagehash6',
            data: {
                dataId: null,
                protocol: ImageDataProtocolType.LOCAL,
                encoding: 'BASE64',
                data: ImageProcessing.milkcatWide
            }
        }]
    } as ItemInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash'
            },
            withRelated: true
        } as TestDataCreateRequest);
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

        testData.listing_item_template_id = createdListingItemTemplate.Id;
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

        testDataUpdated['listing_item_template_id'] = createdListingItemTemplate.Id;

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
