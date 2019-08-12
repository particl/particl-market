// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as Faker from 'faker';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

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

    const options: string[] = [
        'optionA1',
        'optionB2'
    ];

    let sent = false;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

    });

    test('Should fail to post a Proposal because missing profileId', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to post a Proposal because missing proposalTitle', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalTitle').getMessage());
    });

    test('Should fail to post a Proposal because missing proposalDescription', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalDescription').getMessage());
    });

    test('Should fail to post a Proposal because missing daysRetention', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });

    test('Should fail to post a Proposal because missing estimateFee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('estimateFee').getMessage());
    });

    test('Should fail to post a Proposal because missing option1Description', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            estimateFee
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('option1Description').getMessage());
    });

    test('Should fail to post a Proposal because missing option2Description', async () => {
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
        expect(res.error.error.message).toBe(new MissingParamException('option2Description').getMessage());
    });

    test('Should fail to post a Proposal because invalid profileId', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            'INVALID',
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to post a Proposal because invalid proposalTitle', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            0,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalTitle', 'string').getMessage());
    });
/*
    test('Should fail to post a Proposal because invalid proposalDescription', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            0,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalDescription', 'string').getMessage());
    });

    test('Should fail to post a Proposal because invalid daysRetention', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            'INVALID',
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });

    test('Should fail to post a Proposal because invalid estimateFee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            defaultProfile.id,
            title,
            description,
            daysRetention,
            'INVALID',
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });

    test('Should fail to post a Proposal because Profile not found', async () => {

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
        expect(res.error.error.message).toBe(new ModelNotFoundException('Profile').getMessage());
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
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }

    });

    test('Should receive the posted Proposal', async () => {

        expect(sent).toEqual(true);

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
*/
});
