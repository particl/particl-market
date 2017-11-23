import { app } from '../../src/app';
import { DatabaseResetCommand } from '../../src/console/DatabaseResetCommand';
import { Country } from '../../src/api/enums/Country';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { AddressService } from '../../src/api/services/AddressService';
import { Address } from '../../src/api/models/Address';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { Exception } from '../../src/core/api/Exception';
import { EventEmitter } from '../../src/core/api/events';
import { ServerStartedListener } from '../../src/api/listeners/ServerStartedListener';
import { TestUtil } from './lib/TestUtil';

describe('Testing', () => {

    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    const keys = [
        'id', 'updatedAt', 'createdAt', 'title', 'addressLine1', 'addressLine2', 'city', 'country'
    ];

    // let createdId;

    const testData = {
        title: 'title',
        addressLine1: 'addressLine1',
        addressLine2: 'addressLine2',
        city: 'city',
        country: Country.FINLAND,
        profileId: 0
    };

    const testDataUpdated = {
        title: 'title updated',
        addressLine1: 'addressLine1 updated',
        addressLine2: 'addressLine2 updated',
        city: 'city updated',
        country: Country.SWEDEN,
        profileId: 0
    };

    const log: LoggerType = new LoggerType(__filename);
    let addressService: AddressService;

    beforeAll(async () => {

        const testUtil = new TestUtil();
        await testUtil.bootstrapAppContainer(app);

        log.info('bootstrapAppContainer() done');

         // const command = new DatabaseResetCommand();
        // await command.run();

        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        // await addressService.destroyAll();
        // log.info('Database reset done');

    });

    afterAll(async () => {
        //
        // log.info('afterAll');
    });

    test('Should create a new address', async () => {
        log.info('test oi oi oi');
/*
        const addressModel: Address = await addressService.create(testData);
        createdId = addressModel.Id;

        const address = addressModel.toJSON();
        // log.info('address:', address);
        expect(address.title).toBe(testData.title);
        expect(address.addressLine1).toBe(testData.addressLine1);
        expect(address.addressLine2).toBe(testData.addressLine2);
        expect(address.city).toBe(testData.city);
        expect(address.country).toBe(testData.country);
*/
    });
/*
    test('Should throw ValidationException because we want to create an empty address', async () => {
        expect.assertions(1);
        await addressService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );

        // await expect(Promise.reject('octopus')).rejects.toBe('octopus');

        // await expect(addressService.create({})).rejects();

        // expect(await addressService.create({})).toThrowError('Request body is not valid');

        // throw new ValidationException('Request body is not valid', errors);

        // const addressModel: Address = await addressService.create({});
        // const address = addressModel.toJSON();
        // res.expectJson();
        // res.expectStatusCode(400);
    });
*/
    /*
    test('GET       /addresses        Should list addresss with our new create one', async () => {
        const res = await api('GET', '/api/addresses');
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys); // keysWithoutRelated
        const data = res.getData<any[]>();
        expect(data.length).toBe(1);    // one, because if it's something else then the next expects might fail

        const result = data[0];
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('GET       /addresses/:id    Should return one address', async () => {
        const res = await api('GET', `/api/addresses/${createdId}`);
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testData.title);
        expect(result.addressLine1).toBe(testData.addressLine1);
        expect(result.addressLine2).toBe(testData.addressLine2);
        expect(result.city).toBe(testData.city);
        expect(result.country).toBe(testData.country);
    });

    test('PUT       /addresses/:id    Should update the address', async () => {
        const res = await api('PUT', `/api/addresses/${createdId}`, {
            body: testDataUpdated
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectData(keys);

        const result: any = res.getData();
        expect(result.title).toBe(testDataUpdated.title);
        expect(result.addressLine1).toBe(testDataUpdated.addressLine1);
        expect(result.addressLine2).toBe(testDataUpdated.addressLine2);
        expect(result.city).toBe(testDataUpdated.city);
        expect(result.country).toBe(testDataUpdated.country);
    });

    test('DELETE    /addresses/:id    Should delete the address', async () => {
        const res = await api('DELETE', `/api/addresses/${createdId}`);
        res.expectStatusCode(200);
    });

*/

});
