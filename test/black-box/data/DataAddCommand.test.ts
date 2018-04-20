import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import {CreatableModel} from '../../../src/api/enums/CreatableModel';

describe('DataAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const dataCommand = Commands.DATA_ROOT.commandName;
    const addCommand =  Commands.DATA_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const testProfileData = {
        name: 'test-profile',
        address: 'test-address'
    };

    const testActionMessage = {
        action: 'MP_ITEM_ADD',
        objects: [{
            dataId: 'seller',
            dataValue: 'prW9s2UgmRaUjffBoaeMhiHWf3aMABBgLx'
        }],
        data: {
            msgid: 'fceabe5a000000002cc363a3bc350d6bca87b1977335deeba5a554f6',
            version: '0300',
            received: '2018-03-31T03:57:16+0200',
            sent: '2018-03-31T03:57:16+0200',
            from: 'prW9s2UgmRaUjffBoaeMhiHWf3aMABBgLx',
            to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA'
        },
        listing_item_id: 33
    };

    test('Should create test data for Profile', async () => {
        const res = await rpc(dataCommand, [addCommand, CreatableModel.PROFILE, JSON.stringify(testProfileData)]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testProfileData.name);
        expect(result.address).toBe(testProfileData.address);
    });

    test('Should create test data for ActionMessage', async () => {

        const listingItem = await testUtil.generateData(CreatableModel.LISTINGITEM, 1);
        testActionMessage.listing_item_id = listingItem[0].id;

        const res = await rpc(dataCommand, [addCommand, CreatableModel.ACTIONMESSAGE, JSON.stringify(testActionMessage)]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.action).toBe(testActionMessage.action);
        expect(result.MessageObjects[0].dataId).toBe(testActionMessage.objects[0].dataId);
    });

});
