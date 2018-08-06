import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Profile } from '../../../src/api/models/Profile';
import * as Faker from 'faker';
import * as resources from 'resources';

describe('ProposalPost', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalMethod = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostSubCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListSubCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetSubCommand = Commands.PROPOSAL_GET.commandName;
    const daemonMethod = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: Profile;
    let currentBlockNumber;
    let createdProposalHash;
    let createdProposal: resources.Proposal = {};

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

    test('Should fail to post a proposal because it has too few args (0)', async () => {
        createdProposal.title = Faker.lorem.words();
        createdProposal.description = Faker.lorem.paragraph();
        createdProposal.blockStart = currentBlockNumber - 1;
        createdProposal.blockEnd = currentBlockNumber + 100;
        createdProposal.options = [];
        createdProposal.options.push('optionA1');
        createdProposal.options.push('optionB2');

        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has too few args (1)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

        test('Should fail to post a proposal because it has too few args (2)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has too few args (3)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has too few args (4)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has too few args (5)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has too few args (6)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd,
                createdProposal.options[0]
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has an invalid (string) arg (profileId)', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                'invalid proposal ID',
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has an invalid (non-existent) arg (profileId)', async () => {
        const invalidProfileId = 9999999999999999;
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                invalidProfileId,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has an invalid arg (blockStart)', async () => {
        const invalidBlockStart = 'Invalid blockStart';
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                invalidBlockStart,
                createdProposal.blockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should fail to post a proposal because it has an invalid arg (blockEnd)', async () => {
        const invalidBlockEnd = 'Invalid blockEnd';
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                invalidBlockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
            ]);
            response.expectJson();
            response.expectStatusCode(404);
        }
    });

    test('Should post a proposal', async () => {
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
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
            createdProposal.description // created proposal hash
        );
        response.expectJson();
        const result: any = response.getBody()['result'][0];

        expect(result.title).toBe(createdProposal.title);
        expect(result.blockStart).toBe(createdProposal.blockStart);
        expect(result.blockEnd).toBe(createdProposal.blockEnd);
        expect(result.ProposalOptions[0].description).toBe(createdProposal.options[0]);
        expect(result.ProposalOptions[1].description).toBe(createdProposal.options[1]);
        createdProposalHash = result.hash;
    }, 600000); // timeout to 600s

    /*test('Should update a proposal', async () => {
        // Check the old values match
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalGetSubCommand,
                createdProposalHash,
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            expect(result.title).toBe(createdProposal.title);
            expect(result.blockStart).toBe(createdProposal.blockStart);
            expect(result.blockEnd).toBe(createdProposal.blockEnd);
            expect(result.ProposalOptions[0].description).toBe(createdProposal.options[0]);
            expect(result.ProposalOptions[1].description).toBe(createdProposal.options[1]);
        }

        // Get new values for createdProposal
        createdProposal.title = Faker.lorem.words();
        createdProposal.description = Faker.lorem.paragraph();
        createdProposal.blockStart = currentBlockNumber - 1;
        createdProposal.blockEnd = currentBlockNumber + 50;
        createdProposal.options = [];
        createdProposal.options.push('optionA2');
        createdProposal.options.push('optionB2');

        // Update created proposal
        {
            const response: any = await testUtil.rpc(proposalMethod, [
                proposalPostSubCommand,
                defaultProfile.id,
                createdProposal.title,
                createdProposal.description,
                createdProposal.blockStart,
                createdProposal.blockEnd,
                createdProposal.options[0],
                createdProposal.options[1]
            ]);
            response.expectJson();
            response.expectStatusCode(200);
            const result: any = response.getBody()['result'];
            expect(result.result).toEqual('Sent.');
        }

        // Check the new values match
        const response = await testUtil.rpcWaitFor(proposalMethod,
            [
                proposalListSubCommand,
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].description', // property name
            createdProposal.description // created proposal hash
        );
        response.expectJson();
        const result: any = response.getBody()['result'][0];

        expect(result.title).toBe(createdProposal.title);
        expect(result.blockStart).toBe(createdProposal.blockStart);
        expect(result.blockEnd).toBe(createdProposal.blockEnd);
        expect(result.ProposalOptions[0].description).toBe(createdProposal.options[0]);
        expect(result.ProposalOptions[1].description).toBe(createdProposal.options[1]);
    });*/
});
