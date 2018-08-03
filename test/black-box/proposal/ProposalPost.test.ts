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
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalMethod = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostSubCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListSubCommand = Commands.PROPOSAL_LIST.commandName;
    const daemonMethod = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: Profile;
    let currentBlockNumber;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // TODO: defaultProfile might not be the correct one
        defaultProfile = await testUtil.getDefaultProfile();

        {
            const response: any = await testUtil.rpc(daemonMethod, [
                'getblockcount'
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            currentBlockNumber = result;
        }
    });

    test('Should post a proposal', async () => {
        const title = Faker.lorem.words();
        const description = Faker.lorem.paragraph();
        const blockStart = currentBlockNumber - 1;
        const blockEnd = currentBlockNumber + 100;
        const optionA = 'optionA';
        const optionB = 'optionB';
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                title,
                description,
                blockStart,
                blockEnd,
                optionA,
                optionB
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            expect(result.result).toEqual('Sent.');
        }

        const response = await testUtil.rpcWaitFor(proposalMethod,
            [
                proposalListSubCommand,
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].description', // property name
            description // created proposal hash
        );
        response.expectJson();
        const result: any = response.getBody()['result'][0];

        expect(result.title).toBe(title);
        expect(result.blockStart).toBe(blockStart);
        expect(result.blockEnd).toBe(blockEnd);
        expect(result.ProposalOptions[0].description).toBe(optionA);
        expect(result.ProposalOptions[1].description).toBe(optionB);
    }, 600000); // timeout to 600s
});
