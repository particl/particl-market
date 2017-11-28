import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { Currency } from '../../src/api/enums/Currency';

describe('GetListingItemTemplate', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'getlistingitemtemplate';

    let profile;
    // let emptyListingItem;

    const testDataCreate = {
        method: 'createlistingitemtemplate',
        params: [
            0
        ],
        jsonrpc: '2.0'
    };

    const testDataForGet = {
        method: 'getlistingitemtemplate',
        params: [],
        jsonrpc: '2.0'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.addTestProfile();
        console.log('profile', profile);

        /*
        // add profile for testing
        const addDataRes: any = await testUtil.addData('profile', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
        profile = addDataRes.getBody()['result'];

        // add listingitemtemplate for testing
        const addDataRes: any = await testUtil.addData('listingitemtemplate', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
        profile = addDataRes.getBody()['result'];
*/

    });

    test('Should return one Item Template by Id', async () => {
        // create item template
        const res = await api('POST', '/api/rpc', {
            body: testDataCreate
        });
        res.expectJson();
        res.expectStatusCode(200);
        const result: object = res.getBody()['result'];
        const createdId = result['id'];

        // get item template
        testDataForGet.params[0] = createdId;
        const resMain = await api('POST', '/api/rpc', {
            body: testDataForGet
        });
        resMain.expectJson();
        resMain.expectStatusCode(200);
        const resultMain: object = resMain.getBody()['result'];
        expect(resultMain['id']).toBe(testDataForGet.params[0]);
        // check profile
        expect(resultMain['profileId']).toBe(0);
        // check realted models
        expect(resultMain).hasOwnProperty('profile');

        expect(resultMain).hasOwnProperty('ItemInformation');

        expect(resultMain).hasOwnProperty('PaymentInformation');

        expect(resultMain).hasOwnProperty('MessagingInformation');

        expect(resultMain).hasOwnProperty('ListingItemObjects');

        expect(resultMain).hasOwnProperty('ListingItem');
    });
});
