// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/model/MarketService';
import { ProfileService } from '../../../src/api/services/model/ProfileService';
import { SmsgMessageService } from '../../../src/api/services/model/SmsgMessageService';
import { socket, Socket } from 'zeromq';

describe('ZMQWorker', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let smsgMessageService: SmsgMessageService;

    let market: resources.Market;
    let profile: resources.Profile;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app); // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

    });
    // tslint:enable:max-line-length

    test('Should Push some message', async () => {
        log.debug('===================================================================================');
        log.debug('Should Push a message');
        log.debug('===================================================================================');

        const push: Socket = socket('push');

        const addr = 'tcp://127.0.0.1:29001';
        push.bindSync(addr);
        push.connect(addr);
        await push.send('some work');
        await push.send('some more work');
        await push.send('even more work');



/*
        smsgMessage = await smsgMessageService.findOneByMsgId(smsgSendResponse.msgid!, ActionDirection.OUTGOING).then(value => value.toJSON());
        // log.debug('smsgMessage: ', JSON.stringify(smsgMessage, null, 2));
        expect(smsgMessage.msgid).toBe(smsgSendResponse.msgid);
        expect(smsgMessage.direction).toBe(ActionDirection.OUTGOING);
        expect(smsgMessage.type).toBe(GovernanceAction.MPA_PROPOSAL_ADD);
        expect(smsgMessage.status).toBe(SmsgMessageStatus.SENT);
*/
    });

});
