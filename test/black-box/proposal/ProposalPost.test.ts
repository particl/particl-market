// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import * as Faker from 'faker';
import * as resources from 'resources';

describe('ProposalPostCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let defaultProfile: resources.Profile;

    const title = Faker.lorem.words();
    const description = Faker.lorem.paragraph();
    const daysRetention = 2;
    let estimateFee = true;

    const options: string[] = [];
    options.push('optionA1');
    options.push('optionB2');


    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

    });

    test('Should fail to post a Proposal because it has too few args (0)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (1)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (2)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (3)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (4)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (5)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            estimateFee
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has too few args (6)', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0]
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Expected more params.');
    });

    test('Should fail to post a Proposal because it has an invalid (string) arg (profileId)', async () => {

        const invalidProfileId = 'invalid profile id';
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            invalidProfileId,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('profileId needs to be a number.');
    });

    test('Should fail to post a Proposal because it has an invalid (non-existent) arg (profileId)', async () => {

        const invalidProfileId = 9999999999999999;
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            invalidProfileId,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Profile not found.');
    });

    test('Should fail to post a Proposal because it has an invalid arg (daysRetention)', async () => {

        const invalidDaysRetention = 'Invalid daysRetention';
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            invalidDaysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('daysRetention needs to be a number.');
    });

    test('Should estimate Proposal posting fee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];

        log.debug('estimate fee result:', JSON.stringify(result));
        expect(result.result).toEqual('Not Sent.');
    });

    test('Should post a Proposal', async () => {
        estimateFee = false;
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.result).toEqual('Sent.');
    });

    test('Should receive the posted Proposal', async () => {

        const res = await testUtil.rpcWaitFor(proposalCommand,
            [proposalListCommand, '*', '*'],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].title', // property name
            title
        );
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Proposal = res.getBody()['result'][0];

        expect(result.title).toBe(title);
        expect(result.description).toBe(description);
        expect(result.ProposalOptions[0].description).toBe(options[0]);
        expect(result.ProposalOptions[1].description).toBe(options[1]);
    }, 600000); // timeout to 600s

});
