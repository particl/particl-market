import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { CryptocurrencyAddress } from '../../src/api/models/CryptocurrencyAddress';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

import { CryptocurrencyAddressService } from '../../src/api/services/CryptocurrencyAddressService';

describe('CryptocurrencyAddress', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let cryptocurrencyAddressService: CryptocurrencyAddressService;

    let createdId;
    let createdListingItemTemplate;

    const testData = {
        type: CryptocurrencyAddressType.NORMAL,
        address: '123'
    };

    const testDataUpdated = {
        type: CryptocurrencyAddressType.STEALTH,
        address: '456'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        cryptocurrencyAddressService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.CryptocurrencyAddressService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        createdListingItemTemplate = testDataService.generate({
            model: 'listingitemtemplate',
            amount: 1,
            withRelated: true
        }).then(result => {
            log.info('created: ', result);
        }).catch(e => {
            log.error('098: ' + e);
        });

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await cryptocurrencyAddressService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new cryptocurrency address', async () => {

        // log.debug('ListingItemTemplate create with id = ' + listingItemTemplate.profile_id);
        // for ( const o of listingItemTemplate) {
        //    log.debug('#### ' + o);
        // }
        // log.debug('123 ' + listingItemTemplate[0]);
        // log.debug('DONE');

        testData['item_price_id'] = 0;
        const cryptocurrencyAddressModel: CryptocurrencyAddress = await cryptocurrencyAddressService.create(testData);
        createdId = cryptocurrencyAddressModel.Id;

        const result = cryptocurrencyAddressModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('Should throw ValidationException because we want to create a empty cryptocurrency address', async () => {
        expect.assertions(1);
        await cryptocurrencyAddressService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list cryptocurrency addresss with our new create one', async () => {
        const cryptocurrencyAddressCollection = await cryptocurrencyAddressService.findAll();
        const cryptocurrencyAddress = cryptocurrencyAddressCollection.toJSON();
        expect(cryptocurrencyAddress.length).toBe(1);

        const result = cryptocurrencyAddress[0];

        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('Should return one cryptocurrency address', async () => {
        const cryptocurrencyAddressModel: CryptocurrencyAddress = await cryptocurrencyAddressService.findOne(createdId);
        const result = cryptocurrencyAddressModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.address).toBe(testData.address);
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await cryptocurrencyAddressService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the cryptocurrency address', async () => {
        testDataUpdated['item_price_id'] = 0;
        const cryptocurrencyAddressModel: CryptocurrencyAddress = await cryptocurrencyAddressService.update(createdId, testDataUpdated);
        const result = cryptocurrencyAddressModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.address).toBe(testDataUpdated.address);
    });

    test('Should delete the cryptocurrency address', async () => {
        expect.assertions(1);
        await cryptocurrencyAddressService.destroy(createdId);
        await cryptocurrencyAddressService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
