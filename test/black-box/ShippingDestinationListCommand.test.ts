import { rpc, api } from './lib/api';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';

describe('/ShippingDestinationListCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const subCommand = Commands.SHIPPINGDESTINATION_LIST.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            itemLocation: {
                region: 'China',
                address: 'USA'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    let createdTemplateId;
    let createdItemInformationId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const defaultProfile = await testUtil.getDefaultProfile();
        const profileId = defaultProfile.id;
        testDataListingItemTemplate.profile_id = profileId;

         // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        createdTemplateId = result.id;
        createdItemInformationId = result.ItemInformation.id;
    });

    test('Should list empty shipping destination by createdTemplateId', async () => {
        // list shipping destinations
        const resList: any = await rpc(method, [subCommand, 'template', createdTemplateId]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should list shipping destination by createdTemplateId', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [Commands.SHIPPINGDESTINATION_ADD.commandName, createdTemplateId,
            'South Africa', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

        // list shipping destinations
        const resList: any = await rpc(method, [subCommand, 'template', createdTemplateId]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result.length).toBe(1);
        expect(ShippingCountries.getCountryCode('South Africa')).toBe(result[0].country);
        expect(ShippingAvailability.SHIPS).toBe(result[0].shippingAvailability);
        expect(createdItemInformationId).toBe(result[0].itemInformationId);
    });

    test('Should list one shipping destination by RPC', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [Commands.SHIPPINGDESTINATION_ADD.commandName, createdTemplateId,
            'South Africa', ShippingAvailability.SHIPS]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

        // list shipping destinations
        const resList: any = await rpc(method, [subCommand, 'template', createdTemplateId]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result.length).toBe(1);
        expect(ShippingCountries.getCountryCode('South Africa')).toBe(result[0].country);
        expect(ShippingAvailability.SHIPS).toBe(result[0].shippingAvailability);
        expect(createdItemInformationId).toBe(result[0].itemInformationId);
    });

    test('Should list two shipping destination by RPC', async () => {
        // add shipping destination
        const addDataRes: any = await rpc(method, [Commands.SHIPPINGDESTINATION_ADD.commandName, createdTemplateId,
            'China', ShippingAvailability.UNKNOWN]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);

        // list shipping destinations
        const resList: any = await rpc(method, [subCommand, 'template', createdTemplateId]);
        resList.expectJson();
        resList.expectStatusCode(200);
        const result: any = resList.getBody()['result'];
        expect(result.length).toBe(2);
        expect(ShippingCountries.getCountryCode('South Africa')).toBe(result[0].country);
        expect(ShippingAvailability.SHIPS).toBe(result[0].shippingAvailability);
        expect(createdItemInformationId).toBe(result[0].itemInformationId);

        expect(ShippingCountries.getCountryCode('China')).toBe(result[1].country);
        expect(ShippingAvailability.UNKNOWN).toBe(result[1].shippingAvailability);
        expect(createdItemInformationId).toBe(result[1].itemInformationId);
    });

});



