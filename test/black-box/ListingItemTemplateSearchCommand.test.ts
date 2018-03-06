import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('/ListingItemTemplateSearchCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommand = Commands.TEMPLATE_SEARCH.commandName;

    const testDataListingItemTemplate1 = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            }
        }
    };

    const testDataListingItemTemplate2 = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates Second',
            shortDescription: 'Item short description with Templates Second',
            longDescription: 'Item long description with Templates Second',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
                }
            }
        }
    };
    let categoryId;
    let profileId;
    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;
        // create listing item
        testDataListingItemTemplate1.profile_id = profileId;
        const addListingItemTemplate1: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate1);
        const addListingItemTemplate1Result = addListingItemTemplate1;
        categoryId = addListingItemTemplate1Result.ItemInformation.ItemCategory.id;
        testDataListingItemTemplate2.profile_id = profileId;
        const addListingItemTemplate2: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate2);
    });

    test('Should get all Item Templates', async () => {
        // get all listing items
        const getDataRes: any = await rpc(method, [subCommand, 1, 2, 'ASC', profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should get only first item template by pagination', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 1, 1, 'ASC', profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(1);
        // check itemInformation
        expect(result[0]['ItemInformation'].title).toBe(testDataListingItemTemplate1.itemInformation.title);
        expect(result[0]['ItemInformation'].shortDescription).toBe(testDataListingItemTemplate1.itemInformation.shortDescription);
        expect(result[0]['ItemInformation'].longDescription).toBe(testDataListingItemTemplate1.itemInformation.longDescription);
        // check profile
        expect(result[0]['profileId']).toBe(profileId);
        // check realted models
        expect(result).hasOwnProperty('profile');

        expect(result).hasOwnProperty('ItemInformation');

        expect(result).hasOwnProperty('PaymentInformation');

        expect(result).hasOwnProperty('MessagingInformation');

        expect(result).hasOwnProperty('ListingItemObjects');

        expect(result).hasOwnProperty('ListingItem');
    });

    test('Should get second item template by pagination', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 2, 1, 'ASC', profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(1);
        // check itemInformation
        expect(result[0]['ItemInformation'].title).toBe(testDataListingItemTemplate2.itemInformation.title);
        expect(result[0]['ItemInformation'].shortDescription).toBe(testDataListingItemTemplate2.itemInformation.shortDescription);
        expect(result[0]['ItemInformation'].longDescription).toBe(testDataListingItemTemplate2.itemInformation.longDescription);
        // check profile
        expect(result[0]['profileId']).toBe(profileId);
        // check realted models
        expect(result).hasOwnProperty('profile');

        expect(result).hasOwnProperty('ItemInformation');

        expect(result).hasOwnProperty('PaymentInformation');

        expect(result).hasOwnProperty('MessagingInformation');

        expect(result).hasOwnProperty('ListingItemObjects');

        expect(result).hasOwnProperty('ListingItem');
    });

    test('Should return empty listing item templates array if invalid pagination', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 2, 2, 'ASC', profileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const emptyResults: any = getDataRes.getBody()['result'];
        expect(emptyResults).toHaveLength(0);
    });

    test('Should search listing items templates by category key', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 1, 2, 'ASC', profileId, 'cat_high_luxyry_items']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        const category = result[0].ItemInformation.ItemCategory.key;
        expect(result).toHaveLength(2);
        expect('cat_high_luxyry_items').toBe(result[0].ItemInformation.ItemCategory.key);
    });

    test('Should search listing items templates by category id', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 1, 2, 'ASC', profileId, categoryId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(2);
        const category = result[0].ItemInformation.itemCategoryId;
        expect(category).toBe(categoryId);
    });

    test('Should search item templates by ItemInformation title', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 1, 2, 'ASC', profileId, '', testDataListingItemTemplate1.itemInformation.title]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(testDataListingItemTemplate1.itemInformation.title).toBe(result[0].ItemInformation.title);
    });

    test('Should fail because we want to search without profileId', async () => {
        const getDataRes: any = await rpc(method, [subCommand, 1, 2, 'ASC', '']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });
});
