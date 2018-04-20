import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import * as sharp from 'sharp';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import {ObjectHash} from '../../src/core/helpers/ObjectHash';

describe('/publish-image', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMIMAGE_ROOT.commandName;
    const subCommand = Commands.ITEMIMAGE_ADD.commandName;

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

    let createdTemplateId;
    let itemImageId;
    let imageVersion;
    let newInfo;
    let dataBuffer;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;

        // add item image
        const addDataRes: any = await rpc(method, [
            subCommand,
            createdTemplateId,
            'TEST-DATA-ID',
            ImageDataProtocolType.LOCAL,
            'TEST-ENCODING',
            ImageProcessing.milkcatSmall
        ]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        itemImageId = result.ItemImageDatas[0].itemImageId;
        imageVersion = result.ItemImageDatas[0].imageVersion;

        dataBuffer = new Buffer(result.ItemImageDatas[0]['data'], 'base64');
        const imageBuffer = sharp(dataBuffer);
        newInfo = await imageBuffer.metadata();

    });

    test('GET  /item-images/:id/:imageVersion        Should publish an item image', async () => {
        const res = await api('GET', `/api/item-images/${itemImageId}/${imageVersion}`);
        expect(res.res.headers['content-disposition']).toBe(`filename=${imageVersion}.${newInfo.format}`);
        res.expectStatusCode(200);
        expect(res.error).toBe(null);
        expect(res.res).toBeDefined();
    });

    test('GET  /item-images/:id/:imageVersion        Should fail to publish an item image because invalid image id', async () => {
        const imageId = 0;
        const res = await api('GET', `/api/item-images/${imageId}/${imageVersion}`);
        res.expectStatusCode(404);
        expect(res.error).not.toBeNull();
        expect(res.res).toBeUndefined();
    });

    test('GET  /item-images/:id/:imageVersion        Should fail to publish an item image because invalid imageVersion', async () => {
        const version = 'test';
        const res = await api('GET', `/api/item-images/${itemImageId}/${version}`);
        res.expectStatusCode(404);
        expect(res.error).not.toBeNull();
        expect(res.res).toBeUndefined();
    });

    test('POST  /item-images/template/:id        Should publish an item image', async () => {
        expect.assertions(35); // 3 [basic expects] + 4 [image types] * 8 [expects in the loop]

        const auth = 'Basic ' + new Buffer(process.env.RPCUSER + ':' + process.env.RPCPASSWORD).toString('base64');
        const res: any = await api('POST', `/api/item-images/template/${createdTemplateId}`, {
            headers: {
                'Authorization': auth,
                'Content-Type': 'multipart/form-data'
            },
            formData: {
                image: {
                    options: {
                        filename: 'image.jpg',
                        contentType: 'image/jpeg'
                    },
                    value: Buffer.from(ImageProcessing.milkcatSmall, 'base64')
                }
            }
        });

        res.expectStatusCode(200);
        expect(res.error).toBe(null);
        expect(res.res).toBeDefined();

        // For each created image fetch it and check everything matches
        //  (except the image data itself because that's modified during the storage process and therefore difficult to validate)
        for ( const i in res.res.body ) {
            if ( i ) {
                const img = res.res.body[i];
                const imageRes = await api('GET', `/api/item-image-data/${img.id}`);
                expect(imageRes.res.body.data.id).toBe(img.id);
                expect(imageRes.res.body.data.protocol).toBe(img.protocol);
                expect(imageRes.res.body.data.encoding).toBe(img.encoding);
                expect(imageRes.res.body.data.imageVersion).toBe(img.imageVersion);
                expect(imageRes.res.body.data.itemImageId).toBe(img.itemImageId);
                expect(imageRes.res.body.data.createdAt).toBe(img.createdAt);
                expect(imageRes.res.body.data.originalMime).toBe(img.originalMime);
                expect(imageRes.res.body.data.originalName).toBe(img.originalName);
            }
        }
    });

    test('POST  /item-images/template/:id        Should publish an item image', async () => {
        expect.assertions(67); // 3 [basic expects] + 4 [image types] * 8 [expects in the loop]

        const auth = 'Basic ' + new Buffer(process.env.RPCUSER + ':' + process.env.RPCPASSWORD).toString('base64');
        const res: any = await api('POST', `/api/item-images/template/${createdTemplateId}`, {
            headers: {
                'Authorization': auth,
                'Content-Type': 'multipart/form-data'
            },
            formData: {
                imageW: {
                    options: {
                        filename: 'imageW.jpg',
                        contentType: 'image/jpeg'
                    },
                    value: Buffer.from(ImageProcessing.milkcatWide, 'base64')
                },
                imageT: {
                    options: {
                        filename: 'imageT.jpg',
                        contentType: 'image/jpeg'
                    },
                    value: Buffer.from(ImageProcessing.milkcatTall, 'base64')
                }
            }
        });

        res.expectStatusCode(200);
        expect(res.error).toBe(null);
        expect(res.res).toBeDefined();

        // For each created image fetch it and check everything matches
        //  (except the image data itself because that's modified during the storage process and therefore difficult to validate)
        for ( const i in res.res.body ) {
            if ( i ) {
                const img = res.res.body[i];
                const imageRes = await api('GET', `/api/item-image-data/${img.id}`);
                expect(imageRes.res.body.data.id).toBe(img.id);
                expect(imageRes.res.body.data.protocol).toBe(img.protocol);
                expect(imageRes.res.body.data.encoding).toBe(img.encoding);
                expect(imageRes.res.body.data.imageVersion).toBe(img.imageVersion);
                expect(imageRes.res.body.data.itemImageId).toBe(img.itemImageId);
                expect(imageRes.res.body.data.createdAt).toBe(img.createdAt);
                expect(imageRes.res.body.data.originalMime).toBe(img.originalMime);
                expect(imageRes.res.body.data.originalName).toBe(img.originalName);
            }
        }
    });
});
