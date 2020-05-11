// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import {app} from '../../src/app';
import {Logger as LoggerType} from '../../src/core/Logger';
import {Targets, Types} from '../../src/constants';
import {TestUtil} from './lib/TestUtil';
import {TestDataService} from '../../src/api/services/TestDataService';
import {SmsgMessageService} from '../../src/api/services/model/SmsgMessageService';
import {SmsgMessageCreateRequest} from '../../src/api/requests/model/SmsgMessageCreateRequest';
import {SmsgMessageFactory} from '../../src/api/factories/model/SmsgMessageFactory';
import {ActionDirection} from '../../src/api/enums/ActionDirection';
import * from 'jest';

describe('SmsgMessageCollection', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let smsgMessageService: SmsgMessageService;
    let smsgMessageFactory: SmsgMessageFactory;

    let smsgMessages: resources.SmsgMessage[];

    const listingItemMessage = {
        msgid: '000000005b7bf070812a1bd4083e0f367941c8606a263f5709ac2be8',
        version: '0300',
        location: 'inbox',
        received: 1534858853,
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
        read: true,
        sent: 1534849136,
        paid: true,
        daysretention: 4,
        expiration: 1535194736,
        payloadsize: 704,
        from: 'psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW',
        text: '{\"version\":\"0.0.1.0\","action":{"type":"MPA_LISTING_ADD",\"item\":{\"hash\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"information\":{\"title\":\"testing with wallet unlock\",\"short_description\":\"test\",\"long_description\":\"test\",\"category\":[\"cat_ROOT\",\"cat_particl\",\"cat_particl_free_swag\"],\"location\":{\"country\":\"AD\",\"address\":\"a\",\"gps\":{}},\"shipping_destinations\":[],\"images\":[]},\"payment\":{\"type\":\"SALE\",\"escrow\":{\"type\":\"MAD\",\"ratio\":{\"buyer\":100,\"seller\":100}},\"cryptocurrency\":[{\"currency\":\"PART\",\"base_price\":1,\"shipping_price\":{\"domestic\":1,\"international\":1}}]},\"messaging\":[],\"objects\":[],\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"expiryTime\":4}}}'
    };

    const proposalMessage = {
        msgid: '000000005b7bf070170e376faf6555c6cdf8efe9982554bc0b5388ec',
        version: '0201',
        location: 'inbox',
        received: 1534858853,
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
        read: true,
        sent: 1534849136,
        paid: false,
        daysretention: 2,
        expiration: 1535021936,
        payloadsize: 624,
        from: 'psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW',
        text: '{\"version\":\"0.0.1.0\",\"action\":{\"type":\"MPA_PROPOSAL_ADD\",\"submitter\":\"psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW\",\"blockStart\":224827,\"blockEnd\":227707,\"title\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"description\":\"\",\"options\":[{\"optionId\":0,\"description\":\"OK\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"5d32207b35f31ac5acaccbd3f8cc4e2f81f025594455a6dfac62773ae61760a6\"},{\"optionId\":1,\"description\":\"Remove\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"bd1e498cfa1ed48616e8e142feb60406cb3d112b79b265f2807afc828e733fc5\"}],\"hash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\"}}'
    };

    const voteMessage = {
        msgid: '000000005b6d87a774b506ee07f3af86ee777618e5a40a77703defe4',
        version: '0201',
        location: 'inbox',
        received: 1533904808,
        to: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
        read: true,
        sent: 1533904807,
        paid: false,
        daysretention: 2,
        expiration: 1534077607,
        payloadsize: 320,
        from: 'poJJukenuB455RciQ6a1JPe7frNxBLUqLw',
        text: '{\"version\":\"0.0.1.0\",\"action\":{\"type":\"MPA_VOTE\",\"proposalHash\":\"75f0ccdfa65c5b09562b840b1ed862b56155a734c0ec7d0f73d9bc59b6093428\",\"optionId\":1,\"voter\":\"poJJukenuB455RciQ6a1JPe7frNxBLUqLw\",\"block\":217484,\"weight\":1}}'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.model.SmsgMessageFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    test('Should save multiple SmsgMessages at once', async () => {

        const smsgMessageCreateRequest1: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: listingItemMessage
        });
        const smsgMessageCreateRequest2: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: proposalMessage
        });
        const smsgMessageCreateRequest3: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: voteMessage
        });

        const result = await smsgMessageService.createAll([
            smsgMessageCreateRequest1,
            smsgMessageCreateRequest2,
            smsgMessageCreateRequest3
        ]);
        log.debug('result id: ', result);

        const smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        log.debug('result: ', JSON.stringify(smsgMessages, null, 2));

        expect(smsgMessages.length).toBe(3);
    });


});
