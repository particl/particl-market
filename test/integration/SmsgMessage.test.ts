import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { SmsgMessage } from '../../src/api/models/SmsgMessage';

import { SmsgMessageService } from '../../src/api/services/SmsgMessageService';
import * as resources from 'resources';

describe('SmsgMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let smsgMessageService: SmsgMessageService;

    let createdId;

    const proposalMessage = {
        "msgid": "000000005b7bf070170e376faf6555c6cdf8efe9982554bc0b5388ec",
        "version": "0201",
        "location": "inbox",
        "received": 1534858853,
        "to": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
        "read": true,
        "sent": 1534849136,
        "paid": false,
        "daysretention": 2,
        "expiration": 1535021936,
        "payloadsize": 624,
        "from": "psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW",
        "text": "{\"version\":\"0.0.1.0\",\"mpaction\":{\"action\":\"MP_PROPOSAL_ADD\",\"submitter\":\"psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW\",\"blockStart\":224827,\"blockEnd\":227707,\"title\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"description\":\"\",\"options\":[{\"optionId\":0,\"description\":\"OK\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"5d32207b35f31ac5acaccbd3f8cc4e2f81f025594455a6dfac62773ae61760a6\"},{\"optionId\":1,\"description\":\"Remove\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"bd1e498cfa1ed48616e8e142feb60406cb3d112b79b265f2807afc828e733fc5\"}],\"type\":\"ITEM_VOTE\",\"hash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\"}}"
    };

    const listingItemMessage = {
        "msgid": "000000005b7bf070812a1bd4083e0f367941c8606a263f5709ac2be8",
        "version": "0300",
        "location": "inbox",
        "received": 1534858853,
        "to": "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
        "read": true,
        "sent": 1534849136,
        "paid": true,
        "daysretention": 4,
        "expiration": 1535194736,
        "payloadsize": 704,
        "from": "psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW",
        "text": "{\"version\":\"0.0.1.0\",\"item\":{\"hash\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"information\":{\"title\":\"testing with wallet unlock\",\"short_description\":\"test\",\"long_description\":\"test\",\"category\":[\"cat_ROOT\",\"cat_particl\",\"cat_particl_free_swag\"],\"location\":{\"country\":\"AD\",\"address\":\"a\",\"gps\":{}},\"shipping_destinations\":[],\"images\":[]},\"payment\":{\"type\":\"SALE\",\"escrow\":{\"type\":\"MAD\",\"ratio\":{\"buyer\":100,\"seller\":100}},\"cryptocurrency\":[{\"currency\":\"PARTICL\",\"base_price\":1,\"shipping_price\":{\"domestic\":1,\"international\":1}}]},\"messaging\":[],\"objects\":[],\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"expiryTime\":4}}"
    };

    const voteMessage = {
        msgid: "000000005b6d87a774b506ee07f3af86ee777618e5a40a77703defe4",
        version: "0201",
        location: "inbox",
        received: 1533904808,
        to: "pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA",
        read: true,
        sent: 1533904807,
        paid: false,
        daysretention: 2,
        expiration: 1534077607,
        payloadsize: 320,
        from: "poJJukenuB455RciQ6a1JPe7frNxBLUqLw",
        text: "{\"version\":\"0.0.1.0\",\"mpaction\":{\"action\":\"MP_VOTE\",\"proposalHash\":\"75f0ccdfa65c5b09562b840b1ed862b56155a734c0ec7d0f73d9bc59b6093428\",\"optionId\":1,\"voter\":\"poJJukenuB455RciQ6a1JPe7frNxBLUqLw\",\"block\":217484,\"weight\":1}}"
    };



    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.SmsgMessageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await smsgMessageService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should create a new smsg message', async () => {
        // testData['related_id'] = 0;
        const smsgMessageModel: SmsgMessage = await smsgMessageService.create(testData);
        createdId = smsgMessageModel.Id;

        const result = smsgMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.status).toBe(testData.status);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.expiration).toBe(testData.expiration);
        expect(result.daysRetention).toBe(testData.daysRetention);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.content).toBe(testData.content);
    });

    test('Should throw ValidationException because we want to create a empty smsg message', async () => {
        expect.assertions(1);
        await smsgMessageService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list smsg messages with our new create one', async () => {
        const smsgMessageCollection = await smsgMessageService.findAll();
        const smsgMessage = smsgMessageCollection.toJSON();
        expect(smsgMessage.length).toBe(1);

        const result = smsgMessage[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.status).toBe(testData.status);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.expiration).toBe(testData.expiration);
        expect(result.daysRetention).toBe(testData.daysRetention);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.content).toBe(testData.content);
    });

    test('Should return one smsg message', async () => {
        const smsgMessageModel: SmsgMessage = await smsgMessageService.findOne(createdId);
        const result = smsgMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.type).toBe(testData.type);
        expect(result.status).toBe(testData.status);
        expect(result.msgid).toBe(testData.msgid);
        expect(result.version).toBe(testData.version);
        expect(result.received).toBe(testData.received);
        expect(result.sent).toBe(testData.sent);
        expect(result.expiration).toBe(testData.expiration);
        expect(result.daysRetention).toBe(testData.daysRetention);
        expect(result.from).toBe(testData.from);
        expect(result.to).toBe(testData.to);
        expect(result.content).toBe(testData.content);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await smsgMessageService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the smsg message', async () => {
        // testDataUpdated['related_id'] = 0;
        const smsgMessageModel: SmsgMessage = await smsgMessageService.update(createdId, testDataUpdated);
        const result = smsgMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.type).toBe(testDataUpdated.type);
        expect(result.status).toBe(testDataUpdated.status);
        expect(result.msgid).toBe(testDataUpdated.msgid);
        expect(result.version).toBe(testDataUpdated.version);
        expect(result.received).toBe(testDataUpdated.received);
        expect(result.sent).toBe(testDataUpdated.sent);
        expect(result.expiration).toBe(testDataUpdated.expiration);
        expect(result.daysRetention).toBe(testDataUpdated.daysRetention);
        expect(result.from).toBe(testDataUpdated.from);
        expect(result.to).toBe(testDataUpdated.to);
        expect(result.content).toBe(testDataUpdated.content);
    });

    test('Should delete the smsg message', async () => {
        expect.assertions(1);
        await smsgMessageService.destroy(createdId);
        await smsgMessageService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
