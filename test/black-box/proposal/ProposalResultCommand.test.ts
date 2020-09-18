// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ProposalResultCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalResultCommand = Commands.PROPOSAL_RESULT.commandName;
    const proposalPostCommand = Commands.PROPOSAL_POST.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;
    let proposal: resources.Proposal;

    const title = Faker.lorem.words();
    const description = Faker.lorem.paragraph();
    const options: string[] = [
        'optionA1',
        'optionB2'
    ];
    const daysRetention = parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);

    let sent = false;
    const testTimeStamp = Date.now();

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

    });


    test('Should post a Proposal', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalPostCommand,
            market.id,
            title,
            description,
            daysRetention,
            false,
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


    test('Should fail because missing proposalHash', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('proposalHash').getMessage());
    });


    test('Should fail because invalid proposalHash', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('proposalHash', 'string').getMessage());
    });


    test('Should receive the posted Proposal', async () => {

        expect(sent).toEqual(true);
        const response = await testUtil.rpcWaitFor(proposalCommand, [proposalListCommand,
                '*',
                '*'
            ],
            30 * 60,                    // maxSeconds
            200,                    // waitForStatusCode
            '[0].receivedAt',   // property name
            0,
            '>'
        );
        response.expectJson();
        response.expectStatusCode(200);
        const result: resources.Proposal = response.getBody()['result'][0];
        // log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.title).toBe(title);
        expect(result.description).toBe(description);
        expect(result.ProposalOptions[0].description).toBe(options[0]);
        expect(result.ProposalOptions[1].description).toBe(options[1]);

        proposal = result;
    }, 600000); // timeout to 600s



    test('Should return ProposalResult', async () => {
        const res: any = await testUtil.rpc(proposalCommand, [proposalResultCommand,
            proposal.hash
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ProposalResult = res.getBody()['result'];
        expect(result.calculatedAt).toBeGreaterThan(testTimeStamp);
        expect(result.ProposalOptionResults[0].voters).toBeGreaterThanOrEqual(0);
        expect(result.ProposalOptionResults[0].weight).toBeGreaterThanOrEqual(0);
    });

});
