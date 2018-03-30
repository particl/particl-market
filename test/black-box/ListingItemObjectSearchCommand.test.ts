import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';

import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as listingItemTemplateCreateRequestBasic2 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic2.json';
import * as listingItemTemplateCreateRequestBasic3 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic3.json';
import {ObjectHash} from '../../src/core/helpers/ObjectHash';

describe('ListingItemObjectSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const itemObjectCommand = Commands.ITEMOBJECT_ROOT.commandName;
    const searchCommand = Commands.ITEMOBJECT_SEARCH.commandName;

    let defaultMarket;

    // TODO: use data from test/testdata/...
    // listingitemobjects are being worked on and once done this should be moved to testdata
    const testData = listingItemTemplateCreateRequestBasic1;
    testData.listingItemObjects = [{
        type: ListingItemObjectType.CHECKBOX,
        description: 'Test description checkbox',
        order: 1,
        searchable: true
    }, {
        type: ListingItemObjectType.TABLE,
        description: 'Test description table',
        order: 2
    }, {
        type: ListingItemObjectType.DROPDOWN,
        description: 'Test description dropdown',
        order: 7
    }];

    const testDataTwo = listingItemTemplateCreateRequestBasic2;
    testDataTwo.listingItemObjects = [{
        type: ListingItemObjectType.CHECKBOX,
        description: 'Test description checkbox 2 CHECKBOX',
        order: 1
    }, {
        type: ListingItemObjectType.TABLE,
        description: 'Test description table 2',
        order: 2
    }, {
        type: ListingItemObjectType.DROPDOWN,
        description: 'Test description dropdown 2',
        order: 7
    }];

    beforeAll(async () => {
        await testUtil.cleanDb();
        // set hash
        testData.hash = ObjectHash.getHash(testData, HashableObjectType.LISTINGITEM);
        testDataTwo.hash = ObjectHash.getHash(testDataTwo, HashableObjectType.LISTINGITEM);

        defaultMarket = await testUtil.getDefaultMarket();

        testData.market_id = defaultMarket.id;
        testDataTwo.market_id = defaultMarket.id;

        // create listing item
        await testUtil.addData(CreatableModel.LISTINGITEM, testData);
        await testUtil.addData(CreatableModel.LISTINGITEM, testDataTwo);

    });

    test('Should fail to search listing item object for the null searchString', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(itemObjectCommand, [searchCommand]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(400);
    });

    test('Should search empty listing item object for the invalid string search', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(itemObjectCommand, [searchCommand, 'dapp']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return 2 listing item object searched by listing item object type', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(itemObjectCommand, [searchCommand, ListingItemObjectType.CHECKBOX]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toBe(ListingItemObjectType.CHECKBOX);
        expect(result[1].type).toBe(ListingItemObjectType.CHECKBOX);
    });

    test('Should return all listing item object searched by Test text with type or description', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(itemObjectCommand, [searchCommand, 'Test']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(6);
        expect(result[0].description).toMatch('Test');
        expect(result[0].searchable).toBe(1);
        expect(result[1].searchable).toBe(0);
    });

    test('Should return all listing item object matching with given search string in listing item object type or description', async () => {
        // search listing item objects
        const getDataRes: any = await rpc(itemObjectCommand, [searchCommand, 'CHECKBOX']);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].type).toMatch('CHECKBOX');
        expect(result[0].description).toContain('checkbox');
        expect(result[1].type).toMatch('CHECKBOX');
        expect(result[1].description).toContain('checkbox');
        expect(result[0].searchable).toBe(1);
        expect(result[1].searchable).toBe(0);
    });

});

