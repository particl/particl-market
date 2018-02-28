import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';

import { PaymentType } from '../../../src/api/enums/PaymentType';
import { Currency } from '../../../src/api/enums/Currency';

describe('ListingItemTemplateAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommand = Commands.TEMPLATE_ADD.commandName;

    let profile;
    let categoryResult;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // get profile
        profile = await testUtil.getDefaultProfile();
    });

    test('Should create a new Listing Item Template with only Profile Id', async () => {

        const res = await rpc(method, [subCommand, profile.id]);
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

        // todo: test with existing category, not a custom one
        categoryResult = await rpc('category', ['add', 'templateCategory', 'category for Template', 'cat_ROOT']);
        categoryResult.expectJson();
        categoryResult.expectStatusCode(200);
        categoryResult = categoryResult.getBody()['result'];

        const testData = [
            subCommand,
            profile.id,                     // [0]: profile_id
            'Test Title',                   // [1]: title
            'test short description',       // [2]: short description
            'Long description',             // [3]: long description
            categoryResult.id,              // [4]: categoryID
            PaymentType.SALE,               // [5]: payment type
            Currency.PARTICL,               // [6]: currency
            10.1234,                        // [7]: base price
            2.12341234,                     // [8]: domestic shipping price
            1.12341234,                     // [9]: international shipping price
            'Pasfdasfzcxvcvzcxvcxzvsfadf4'  // [11]: payment address
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
        expect(result.Profile.id).toBe(testData[1]);
        expect(result.ItemInformation.title).toBe(testData[2]);
        expect(result.ItemInformation.shortDescription).toBe(testData[3]);
        expect(result.ItemInformation.longDescription).toBe(testData[4]);
        expect(result.ItemInformation.ItemCategory.id).toBe(testData[5]);
        expect(result.PaymentInformation.type).toBe(testData[6]);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData[7]);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData[8]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData[9]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData[10]);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData[11]);

    });

    test('Should create a new Listing Item Template by RPC with Profile + Item-information + Payment-information without payment-address', async () => {

        const testData = [
            subCommand,
            profile.id,                     // [0]: profile_id
            'Test Title 2',                 // [1]: title
            'test short description 2',     // [2]: short description
            'Long description 2',           // [3]: long description
            categoryResult.id,              // [4]: categoryID
            PaymentType.SALE,               // [5]: payment type
            Currency.PARTICL,               // [6]: currency
            10.1234,                        // [7]: base price
            2.12341234,                     // [8]: domestic shipping price
            1.12341234                      // [9]: international shipping price
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
        expect(result.Profile.id).toBe(testData[1]);
        expect(result.ItemInformation.title).toBe(testData[2]);
        expect(result.ItemInformation.shortDescription).toBe(testData[3]);
        expect(result.ItemInformation.longDescription).toBe(testData[4]);
        expect(result.ItemInformation.ItemCategory.id).toBe(testData[5]);
        expect(result.PaymentInformation.type).toBe(testData[6]);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData[7]);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData[8]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData[9]);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData[10]);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).not.toBeDefined();

    });

    test('Should fail because we want to create an empty ItemTemplate', async () => {
        const testData = [subCommand];
        const res = await rpc(method, testData);
        res.expectJson();
        res.expectStatusCode(400);
    });
});
