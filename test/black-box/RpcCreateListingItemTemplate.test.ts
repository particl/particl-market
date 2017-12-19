import { rpc, api } from './lib/api';

import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { Currency } from '../../src/api/enums/Currency';

describe('CreateListingItemTemplate', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'createlistingitemtemplate';

    let profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // add profile for testing
        const addDataRes: any = await testUtil.addData('profile', { name: 'TESTING-ADDRESS-PROFILE-NAME' });
        profile = addDataRes.getBody()['result'];

    });

    test('Should create a new Listing Item Template with only Profile Id', async () => {


        const res = await rpc(method, [profile.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.Profile.id).toBe(profile.id);
        expect(result.Profile.name).toBe(profile.name);
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');
    });

    test('Should create a new Listing Item Template by RPC with Profile + Item-information + Payment-information', async () => {

        const testData = [
            profile.id,                     // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            'cat_electronics_other',        // [4]: category, one of default category keys
            PaymentType.SALE,               // [5]: payment type
            Currency.PARTICL,               // [6]: currency
            10.1234,                        // [7]: base price
            2.12341234,                     // [8]: domestic shipping price
            1.12341234,                     // [9]: international shipping price
            'Pasfdasfzcxvcvzcxvcxzvsfadf4'  // [10]: payment address
        ];

        const res = await rpc(method, testData);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');
        expect(result.Profile.id).toBe(testData[0]);
        expect(result.ItemInformation.title).toBe(testData[1]);
        expect(result.ItemInformation.shortDescription).toBe(testData[2]);
        expect(result.ItemInformation.longDescription).toBe(testData[3]);
        expect(result.ItemInformation.ItemCategory.key).toBe(testData[4]);
        expect(result.PaymentInformation.type).toBe(testData[5]);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData[6]);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData[7]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData[8]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData[9]);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testData[10]);

    });

    test('Should fail because we want to create an empty ItemTemplate', async () => {
        const testData = [];
        const res = await rpc(method, testData);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
