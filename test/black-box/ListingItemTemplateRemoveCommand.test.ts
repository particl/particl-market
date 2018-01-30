import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ListingItemTemplateRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommand = Commands.TEMPLATE_REMOVE.commandName;

    let profile;
    let createdTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // add profile for testing
        profile = await testUtil.getDefaultProfile();
    });

    test('Should remove Listing Item Template', async () => {

        const listingitemtemplate = await testUtil.generateData('listingitemtemplate', 1);
        createdTemplateId = listingitemtemplate[0]['id'];
        // remove Listing Item Template
        const result: any = await rpc(method, [subCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail remove Listing Item Template because Listing Item Template already removed', async () => {
        // remove Listing item template
        const result: any = await rpc(method, [subCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
    });
});
