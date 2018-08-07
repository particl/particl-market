import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Profile } from '../../../src/api/models/Profile';
import * as Faker from 'faker';
import * as resources from 'resources';

describe('ProposalPostCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const proposalGetCommand = Commands.PROPOSAL_GET.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: Profile;
    let currentBlock;
    let createdProposalHash;

    const title = Faker.lorem.words();
    const description = Faker.lorem.paragraph();
    let blockStart;
    let blockEnd;
    const options = [];
    options.push('optionA1');
    options.push('optionB2');


    beforeAll(async () => {
        await testUtil.cleanDb();

        // TODO: defaultProfile might not be the correct one
        defaultProfile = await testUtil.getDefaultProfile();

        // get current block
        const currentBlockRes: any = await rpc(daemonCommand, ['getblockcount']);
        currentBlockRes.expectStatusCode(200);
        currentBlock = currentBlockRes.getBody()['result'];
        log.debug('currentBlock:', currentBlock);

        blockStart = currentBlock - 1;
        blockEnd = currentBlock + 100;

    });

    test('Should fail to post a proposal because it has too few args (0)', async () => {

        // <profileId> <proposalTitle> <proposalDescription> <blockStart> <blockEnd> <option1Description> <option2Description> [optionNDescription...]
        const response: any = await testUtil.rpc(proposalCommand, [proposalPostCommand]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has too few args (1)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has too few args (2)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title
        ]);
        response.expectJson();
        response.expectStatusCode(404);
});

    test('Should fail to post a proposal because it has too few args (3)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has too few args (4)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            blockStart
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has too few args (5)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            blockStart,
            blockEnd
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has too few args (6)', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            blockStart,
            blockEnd,
            options[0]
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has an invalid (string) arg (profileId)', async () => {

        const invalidProfileId = 'invalid profile id';
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            invalidProfileId,
            title,
            description,
            blockStart,
            blockEnd,
            options[0],
            options[1]
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has an invalid (non-existent) arg (profileId)', async () => {

        const invalidProfileId = 9999999999999999;
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            invalidProfileId,
            title,
            description,
            blockStart,
            blockEnd,
            options[0],
            options[1]
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has an invalid arg (blockStart)', async () => {

        const invalidBlockStart = 'Invalid blockStart';
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            invalidBlockStart,
            blockEnd,
            options[0],
            options[1]
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should fail to post a proposal because it has an invalid arg (blockEnd)', async () => {

        const invalidBlockEnd = 'Invalid blockEnd';
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            blockStart,
            invalidBlockEnd,
            options[0],
            options[1]
        ]);
        response.expectJson();
        response.expectStatusCode(404);
    });

    test('Should post a proposal', async () => {
        const response: any = await testUtil.rpc(proposalCommand, [
            proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            blockStart,
            blockEnd,
            options[0],
            options[1]
        ]);
        response.expectJson();
        response.expectStatusCode(200);

        let result: any = response.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should receive the posted proposal', async () => {

        const response = await testUtil.rpcWaitFor(proposalCommand,
            [proposalListCommand, '*', '*'],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].title', // property name
            title
        );
        response.expectJson();
        const result: resources.Proposal = response.getBody()['result'][0];

        expect(result.title).toBe(title);
        expect(result.description).toBe(description);
        expect(result.blockStart).toBe(blockStart);
        expect(result.blockEnd).toBe(blockEnd);
        expect(result.ProposalOptions[0].description).toBe(options[0]);
        expect(result.ProposalOptions[1].description).toBe(options[1]);
        createdProposalHash = result.hash;
    }, 600000); // timeout to 600s

});
