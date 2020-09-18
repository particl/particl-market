// Copyright (c) 2017-2020, The Particl Market developers
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
import { SmsgSendResponse } from '../../../src/api/responses/SmsgSendResponse';

describe('ProposalPostCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100 * process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    const title = Faker.lorem.words();
    const description = Faker.lorem.paragraph();
    const daysRetention = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
    let estimateFee = true;

    const options: string[] = [
        'optionA1',
        'optionB2'
    ];

    let sent = false;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });

    test('Should fail because missing marketId', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });


    test('Should fail because missing proposalTitle', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalTitle').getMessage());
    });


    test('Should fail because missing proposalDescription', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalDescription').getMessage());
    });


    test('Should fail because missing daysRetention', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });


    test('Should fail because missing estimateFee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('estimateFee').getMessage());
    });


    test('Should fail because missing option1Description', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            estimateFee
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('option1Description').getMessage());
    });


    test('Should fail because missing option2Description', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
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


    test('Should fail because invalid marketId', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            true,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('marketId', 'number').getMessage());
    });


    test('Should fail because invalid proposalTitle', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            true,
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


    test('Should fail because invalid proposalDescription', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            true,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalDescription', 'string').getMessage());
    });


    test('Should fail because invalid daysRetention', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            true,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });


    test('Should fail because invalid estimateFee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            'true',
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });


    test('Should fail because invalid option1Description', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            estimateFee,
            true,
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('option1Description', 'string').getMessage());
    });


    test('Should fail because invalid option2Description', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('option2Description', 'string').getMessage());
    });


    test('Should fail because daysRetention too large', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention + 1,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention',
            'smaller than ' + process.env.PAID_MESSAGE_RETENTION_DAYS).getMessage());
    });


    test('Should fail because Market not found', async () => {

        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            0,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should estimate Proposal posting fee', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            estimateFee,
            options[0],
            options[1]
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: SmsgSendResponse = res.getBody()['result'];

        log.debug('estimate fee result:', JSON.stringify(result));
        expect(result.result).toEqual('No fee for FREE message.');
    });


    test('Should post a Proposal', async () => {
        estimateFee = false;
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
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
        const response = await testUtil.rpcWaitFor(proposalCommand, [proposalListCommand,
                '*',
                '*'
            ],
            30 * 60, // maxSeconds
            200, // waitForStatusCode
            '[0].title', // property name
            title
        );
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Proposal = response.getBody()['result'][0];

        expect(result.title).toBe(title);
        expect(result.description).toBe(description);
        expect(result.ProposalOptions[0].description).toBe(options[0]);
        expect(result.ProposalOptions[1].description).toBe(options[1]);
    }, 600000); // timeout to 600s

});
