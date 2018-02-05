import * as _ from 'lodash';
import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';

describe('/ProfileListCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.PROFILE_ROOT.commandName;
    const subCommand = Commands.PROFILE_LIST.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return no profile', async () => {
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1); // getting default one
    });

    test('Should return one profile', async () => {
        // generate single profile
        const generateRes = await testUtil.generateData(CreatableModel.PROFILE, 1);
        // get list of profile
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should return 4 profile', async () => {
        // generate three more profile
        const generateRes = await testUtil.generateData(CreatableModel.PROFILE, 3);

        // get list of profile
        const res = await rpc(method, [subCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(5);
    });
});
