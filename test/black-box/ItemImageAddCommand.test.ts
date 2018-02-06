import { rpc, api } from './lib/api';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/ItemImageAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();

    const method = Commands.ITEMIMAGE_ROOT.commandName;
    const subCommand = Commands.ITEMIMAGE_ADD.commandName;

    const keys = [
        'id', 'hash', 'updatedAt', 'createdAt'
    ];

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
        title: 'item title1',
        shortDescription: 'item short desc1',
        longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        },
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    const pageNumber = 1;
    let createdTemplateId;
    let createdItemInfoId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;
        createdItemInfoId = addListingItemTempRes.ItemInformation.id;
    });

    test('Should add item image for Item information with blank ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(createdItemInfoId).toBe(result.itemInformationId);
        expect(result.ItemImageData.dataId).toBe('');
        expect(result.ItemImageData.protocol).toBe('');
        expect(result.ItemImageData.encoding).toBe('');
        expect(result.ItemImageData.data).toBe('');
        expect(result.ItemImageData.itemImageId).toBe(result.id);
    });

    test('Should failed to add item image because invalid ItemImageData protocol', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, 'TEST-DATA-ID', 'TEST-DATA-PROTOCOL', 'TEST-ENCODING', 'TEST-DATA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(400);
    });

    test('Should add item image with ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId, 'TEST-DATA-ID', ImageDataProtocolType.LOCAL, 'TEST-ENCODING', 'TEST-DATA']);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(createdItemInfoId).toBe(result.itemInformationId);
        expect(result.ItemImageData.dataId).toBe('TEST-DATA-ID');
        expect(result.ItemImageData.protocol).toBe(ImageDataProtocolType.LOCAL);
        expect(result.ItemImageData.encoding).toBe('TEST-ENCODING');
        expect(result.ItemImageData.data).toBe('TEST-DATA');
        expect(result.ItemImageData.itemImageId).toBe(result.id);
    });
});



