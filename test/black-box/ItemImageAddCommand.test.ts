import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import {ItemImageDataUpdateRequest} from '../../src/api/requests/ItemImageDataUpdateRequest';

describe('ItemImageAddCommand', () => {
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

    test('Should fail to add item image for Item information with blank ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [subCommand, createdTemplateId]);

        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    // TODO: why does this return 400
/*
    test('Should failed to add item image because invalid ItemImageData protocol', async () => {
        const addDataRes: any = await rpc(method,
            [subCommand, createdTemplateId, 'TEST-DATA-ID', 'INVALID_PROTOCOL', 'BASE64', ImageProcessing.milkcat]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });
*/
    test('Should add item image with ItemImageData', async () => {
        // add item image
        const addDataRes: any = await rpc(method, [
            subCommand,
            createdTemplateId,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'BASE64',
            ImageProcessing.milkcatSmall
        ]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        addDataRes.expectDataRpc(keys);
        const result: any = addDataRes.getBody()['result'];
        expect(result.itemInformationId).toBe(createdItemInfoId);

        for ( const imageData of result.ItemImageDatas ) {
            console.log('Should add item: result.ItemImageDatas[i]: ' + JSON.stringify(imageData, null, 2));
            expect(imageData.dataId).toBe('TEST-DATA-ID');
            expect(imageData.protocol).toBe(ImageDataProtocolType.LOCAL);
            expect(imageData.encoding).toBe('BASE64');
            expect(imageData.itemImageId).toBe(result.id);
            if ( imageData.imageVersion === ImageVersions.ORIGINAL.propName ) {
                // Check image dimensions match ORIGINAL image dimensions
            }
        }
    });

});



