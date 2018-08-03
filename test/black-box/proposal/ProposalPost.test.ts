import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { Profile } from '../../../src/api/models/Profile';
import * as Faker from 'faker';

describe('ProposalPost', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalMethod = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostSubCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListSubCommand = Commands.PROPOSAL_LIST.commandName;

    let defaultProfile: Profile;
    // let createdListingItemTemplate: ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // TODO: defaultProfile might not be the correct one
        defaultProfile = await testUtil.getDefaultProfile();

        /*const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            false,  // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as ListingItemTemplate[];
        createdListingItemTemplate = listingItemTemplates[0];*/

        // TODO: Get current block and save it for the post test
    });

    test('Should post a proposal', async () => {
        const testData = testUtil.generateData(CreatableModel.PROPOSAL, 1, false, []);
        const title = Faker.lorem.words(); // TODO: Might want to generate this
        const description = Faker.lorem.paragraph();
        let response: any = await testUtil.rpc(proposalMethod, [
            proposalPostSubCommand,
            defaultProfile.id,
            title,
            description,
            0,
            1000000, // TODO: This needs to be made dynamic
            'optionA',
            'optionB'
        ]);
        response.expectJson();
        response.expectStatusCode(200);
        const result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');

        response = await testUtil.rpcWaitFor(proposalMethod,
            [
                proposalListSubCommand,
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].description', // property name
            description // created proposal hash
        );
        response.expectJson();
        response.expectStatusCode(200);

        // expect(result.shippingAvailability).toBe(ShippingAvailability.SHIPS);
    });
});
