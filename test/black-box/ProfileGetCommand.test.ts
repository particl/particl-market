import * as _ from 'lodash';
import { api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Country } from '../../src/api/enums/Country';
import { Logger } from '../../src/core/Logger';
import { ProfileGetCommand } from '../../src/api/commands/profile/ProfileGetCommand';
import { ProfileCreateCommand } from '../../src/api/commands/profile/ProfileCreateCommand';

describe('/ProfileGetCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const profileService = null;
    const getProfileMethod =  new ProfileGetCommand(profileService, Logger).name;
    const createProfileMethod =  new ProfileCreateCommand(profileService, Logger).name;

    const keys = [
        'id', 'name', 'updatedAt', 'createdAt'
    ];

    const testData = {
        method: createProfileMethod,
        params: [
            'DEFAULT-PROFILE', 'DEFAULT-PROFILE-ADDRESS'
        ],
        jsonrpc: '2.0'
    };

    const testData2 = {
        name: 'DEFAULT-PROFILE-NAME',
        address: 'DEFAULT-ADDRESS',
        shippingAddresses: [{
            title: 'Title',
            addressLine1: 'Add',
            addressLine2: 'ADD 22',
            city: 'city',
            country: Country.SWEDEN,
            zipCode: '85001'
        }, {
            title: 'Tite',
            addressLine1: 'Ad',
            addressLine2: 'ADD 222',
            city: 'city',
            country: Country.FINLAND,
            zipCode: '85001'
        }]
    };

    const testDataGet = {
        method: getProfileMethod,
        params: [
            '0'
        ],
        jsonrpc: '2.0'
    };

    let createdId;
    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return one profile by ID', async () => {
        // created profile
        const res = await api('POST', '/api/rpc', {
            body: testData
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: object = res.getBody()['result'];
        createdId = result['id'];

        // get profile
        testDataGet.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataGet
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.id).toBe(testDataGet.params[0]);
    });

    test('Should return one profile with addresses by ID', async () => {
        // create profile
        const res = await api('POST', '/api/profiles', {
            body: testData2
        });
        res.expectJson();
        res.expectStatusCode(201);
        res.expectData(keys);
        createdId = res.getData()['id'];

        // get profile
        testDataGet.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataGet
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        resMain.expectDataRpc(keys);
        const resultMain: any = resMain.getBody()['result'];
        expect(resultMain.id).toBe(testDataGet.params[0]);
        expect(resultMain.ShippingAddresses).toHaveLength(2);
    });

    test('Should return one profile by Name', async () => {
        testDataGet.params[0] = 'DEFAULT-PROFILE-NAME';
        const res = await api('POST', '/api/rpc', {
            body: testDataGet
        });
        res.expectJson();
        res.expectStatusCode(200);
        res.expectDataRpc(keys);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testData2.name);
    });
});
