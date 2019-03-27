// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { SmsgMessage } from '../../src/api/models/SmsgMessage';
import { SmsgMessageService } from '../../src/api/services/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../src/api/requests/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../src/api/factories/SmsgMessageFactory';
import { SmsgMessageStatus } from '../../src/api/enums/SmsgMessageStatus';
import { IncomingSmsgMessage } from '../../src/api/messages/IncomingSmsgMessage';
import { SmsgMessageSearchParams } from '../../src/api/requests/SmsgMessageSearchParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionMessageTypes } from '../../src/api/enums/ActionMessageTypes';
import { GovernanceAction } from '../../src/api/enums/GovernanceAction';

describe('SmsgMessage', () => {
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
        text: '{\"version\":\"0.0.1.0\",\"item\":{\"hash\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"information\":{\"title\":\"testing with wallet unlock\",\"short_description\":\"test\",\"long_description\":\"test\",\"category\":[\"cat_ROOT\",\"cat_particl\",\"cat_particl_free_swag\"],\"location\":{\"country\":\"AD\",\"address\":\"a\",\"gps\":{}},\"shipping_destinations\":[],\"images\":[]},\"payment\":{\"type\":\"SALE\",\"escrow\":{\"type\":\"MAD\",\"ratio\":{\"buyer\":100,\"seller\":100}},\"cryptocurrency\":[{\"currency\":\"PARTICL\",\"base_price\":1,\"shipping_price\":{\"domestic\":1,\"international\":1}}]},\"messaging\":[],\"objects\":[],\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"expiryTime\":4}}'
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
        text: '{\"version\":\"0.0.1.0\",\"mpaction\":{\"action\":\"MP_PROPOSAL_ADD\",\"submitter\":\"psERtzYWqnZ9dXD9BqEW1ZA7dnLTHaoXfW\",\"blockStart\":224827,\"blockEnd\":227707,\"title\":\"1173c5f72a5612b9bccff555d39add69362407a3d034e9aaf7cd9f3529249260\",\"description\":\"\",\"options\":[{\"optionId\":0,\"description\":\"OK\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"5d32207b35f31ac5acaccbd3f8cc4e2f81f025594455a6dfac62773ae61760a6\"},{\"optionId\":1,\"description\":\"Remove\",\"proposalHash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\",\"hash\":\"bd1e498cfa1ed48616e8e142feb60406cb3d112b79b265f2807afc828e733fc5\"}],\"type\":\"ITEM_VOTE\",\"hash\":\"4b9bd65e277e90b9a9698ec804d8fa2832d69d17df230aa82a4145b34bde5244\"}}'
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
        text: '{\"version\":\"0.0.1.0\",\"mpaction\":{\"action\":\"MP_VOTE\",\"proposalHash\":\"75f0ccdfa65c5b09562b840b1ed862b56155a734c0ec7d0f73d9bc59b6093428\",\"optionId\":1,\"voter\":\"poJJukenuB455RciQ6a1JPe7frNxBLUqLw\",\"block\":217484,\"weight\":1}}'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.SmsgMessageService);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.SmsgMessageFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
    });

    const expectCreateRequestFromSmsgMessage = (
        result: SmsgMessageCreateRequest,
        type: ActionMessageTypes,
        status: SmsgMessageStatus,
        smsgMessage: IncomingSmsgMessage) => {

        expect(result.type).toBe(type);
        expect(result.status).toBe(status);
        expect(result.msgid).toBe(smsgMessage.msgid);
        expect(result.version).toBe(smsgMessage.version);
        expect(result.daysretention).toBe(smsgMessage.daysretention);
        expect(result.from).toBe(smsgMessage.from);
        expect(result.to).toBe(smsgMessage.to);
        expect(result.text).toBe(smsgMessage.text);

        expect(result.received).toBe(smsgMessage.received * 1000);
        expect(result.sent).toBe(smsgMessage.sent * 1000);
        expect(result.expiration).toBe(smsgMessage.expiration * 1000);

    };

    const expectSmsgMessageFromCreateRequest = (
        result: resources.SmsgMessage,
        type: ActionMessageTypes,
        status: SmsgMessageStatus,
        createRequest: SmsgMessageCreateRequest) => {

        expect(result.id).not.toBeNull();
        expect(result.type).toBe(type);
        expect(result.status).toBe(status);
        expect(result.msgid).toBe(createRequest.msgid);
        expect(result.version).toBe(createRequest.version);
        expect(result.received).toBe(createRequest.received);
        expect(result.sent).toBe(createRequest.sent);
        expect(result.expiration).toBe(createRequest.expiration);
        expect(result.daysretention).toBe(createRequest.daysretention);
        expect(result.from).toBe(createRequest.from);
        expect(result.to).toBe(createRequest.to);
        expect(result.text).toBe(createRequest.text);

        expect(result.received).toBeGreaterThan(1530000000000);
        expect(result.sent).toBeGreaterThan(1530000000000);
        expect(result.expiration).toBeGreaterThan(1530000000000);
        expect(result.createdAt).toBeGreaterThan(1530000000000);
        expect(result.updatedAt).toBeGreaterThan(1530000000000);
    };

    test('Should create a new SmsgMessage from listingItemMessage', async () => {

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get(listingItemMessage);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, MPAction.MPA_LISTING_ADD, SmsgMessageStatus.NEW, listingItemMessage);

        const smsgMessageModel = await smsgMessageService.create(smsgMessageCreateRequest);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, MPAction.MPA_LISTING_ADD, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });

    test('Should create a new SmsgMessage from proposalMessage', async () => {

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get(proposalMessage);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, GovernanceAction.MP_PROPOSAL_ADD, SmsgMessageStatus.NEW, proposalMessage);

        const smsgMessageModel = await smsgMessageService.create(smsgMessageCreateRequest);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, GovernanceAction.MP_PROPOSAL_ADD, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });

    test('Should create a new SmsgMessage from voteMessage', async () => {

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get(voteMessage);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, GovernanceAction.MP_VOTE, SmsgMessageStatus.NEW, voteMessage);

        const smsgMessageModel = await smsgMessageService.create(smsgMessageCreateRequest);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, GovernanceAction.MP_VOTE, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });

    test('Should throw ValidationException because we want to create a empty SmsgMessage', async () => {
        expect.assertions(1);
        await smsgMessageService.create({} as SmsgMessageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list all SmsgMessages', async () => {
        const smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(3);
    });

    test('Should find one SmsgMessage using id', async () => {
        const smsgMessageModel: SmsgMessage = await smsgMessageService.findOne(smsgMessages[0].id);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();

        expect(result.type).toBe(smsgMessages[0].type);
        expect(result.status).toBe(smsgMessages[0].status);
        expect(result.msgid).toBe(smsgMessages[0].msgid);
        expect(result.version).toBe(smsgMessages[0].version);
        expect(result.received).toBe(smsgMessages[0].received);
        expect(result.sent).toBe(smsgMessages[0].sent);
        expect(result.expiration).toBe(smsgMessages[0].expiration);
        expect(result.daysretention).toBe(smsgMessages[0].daysretention);
        expect(result.from).toBe(smsgMessages[0].from);
        expect(result.to).toBe(smsgMessages[0].to);
        expect(result.text).toBe(smsgMessages[0].text);
    });

    test('Should find one SmsgMessage using msgid', async () => {
        const smsgMessageModel: SmsgMessage = await smsgMessageService.findOneByMsgId(smsgMessages[0].msgid);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();

        expect(result.type).toBe(smsgMessages[0].type);
        expect(result.status).toBe(smsgMessages[0].status);
        expect(result.msgid).toBe(smsgMessages[0].msgid);
        expect(result.version).toBe(smsgMessages[0].version);
        expect(result.received).toBe(smsgMessages[0].received);
        expect(result.sent).toBe(smsgMessages[0].sent);
        expect(result.expiration).toBe(smsgMessages[0].expiration);
        expect(result.daysretention).toBe(smsgMessages[0].daysretention);
        expect(result.from).toBe(smsgMessages[0].from);
        expect(result.to).toBe(smsgMessages[0].to);
        expect(result.text).toBe(smsgMessages[0].text);
    });

    test('Should update the SmsgMessage', async () => {

        const updatedData = smsgMessages[0];
        updatedData.text = '';

        const smsgMessageModel: SmsgMessage = await smsgMessageService.update(smsgMessages[0].id, updatedData);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.type).toBe(updatedData.type);
        expect(result.status).toBe(updatedData.status);
        expect(result.msgid).toBe(updatedData.msgid);
        expect(result.version).toBe(updatedData.version);
        expect(result.received).toBe(updatedData.received);
        expect(result.sent).toBe(updatedData.sent);
        expect(result.expiration).toBe(updatedData.expiration);
        expect(result.daysretention).toBe(updatedData.daysretention);
        expect(result.from).toBe(updatedData.from);
        expect(result.to).toBe(updatedData.to);
        expect(result.text).toBe(updatedData.text);
    });

    test('Should searchBy for SmsgMessages: [ListingItemMessageType.MP_ITEM_ADD]', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD],
            age: 0
        } as SmsgMessageSearchParams;

        const smsgMessageCollection = await smsgMessageService.searchBy(searchParams);
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(1);
    });

    test('Should searchBy for SmsgMessages: [ListingItemMessageType.MP_ITEM_ADD, ProposalMessageType.MP_PROPOSAL_ADD]', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MP_PROPOSAL_ADD],
            age: 0
        } as SmsgMessageSearchParams;

        const smsgMessageCollection = await smsgMessageService.searchBy(searchParams);
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(2);
    });

    test('Should searchBy for SmsgMessages: [MPAction.MP_ITEM_ADD, GovernanceAction.MP_PROPOSAL_ADD, GovernanceAction.MP_VOTE], status: NEW', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MP_PROPOSAL_ADD, GovernanceAction.MP_VOTE],
            age: 0
        } as SmsgMessageSearchParams;

        const smsgMessageCollection = await smsgMessageService.searchBy(searchParams);
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(3);
        expect(smsgMessages[0].received).toBeGreaterThan(smsgMessages[2].received);
    });

    test('Should searchBy for SmsgMessages: empty [] should find all', async () => {
        const types: any[] = [];
        const searchParams = {
            order: SearchOrder.ASC,
            orderByColumn: 'received',
            status: SmsgMessageStatus.NEW,
            types,
            age: 0
        } as SmsgMessageSearchParams;

        const smsgMessageCollection = await smsgMessageService.searchBy(searchParams);
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(3);
        expect(smsgMessages[0].received).toBeLessThan(smsgMessages[2].received);

    });

    test('Should update SmsgMessage status to SmsgMessageStatus.PROCESSING', async () => {

        expect(smsgMessages.length).toBe(3);

        const message = _.find(smsgMessages, { type: MPAction.MPA_LISTING_ADD });
        expect(message.type).toBe(MPAction.MPA_LISTING_ADD);

        const updatedData = message;
        updatedData.status = SmsgMessageStatus.PROCESSING;

        const smsgMessageModel: SmsgMessage = await smsgMessageService.update(message.id, updatedData);
        const result: resources.SmsgMessage = smsgMessageModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.type).toBe(updatedData.type);
        expect(result.status).toBe(updatedData.status);
        expect(result.msgid).toBe(updatedData.msgid);
        expect(result.version).toBe(updatedData.version);
        expect(result.received).toBe(updatedData.received);
        expect(result.sent).toBe(updatedData.sent);
        expect(result.expiration).toBe(updatedData.expiration);
        expect(result.daysretention).toBe(updatedData.daysretention);
        expect(result.from).toBe(updatedData.from);
        expect(result.to).toBe(updatedData.to);
        expect(result.text).toBe(updatedData.text);
    });

    test('Should searchBy for SmsgMessages: [MPAction.MP_ITEM_ADD, GovernanceAction.MP_PROPOSAL_ADD, GovernanceAction.MP_VOTE], status: NEW', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MP_PROPOSAL_ADD, GovernanceAction.MP_VOTE],
            age: 0
        } as SmsgMessageSearchParams;

        const smsgMessageCollection = await smsgMessageService.searchBy(searchParams);
        smsgMessages = smsgMessageCollection.toJSON();

        expect(smsgMessages.length).toBe(2);
    });

    // todo: add searchby tests, missing msgid at least

    test('Should delete the SmsgMessage', async () => {
        expect.assertions(2);
        await smsgMessageService.destroy(smsgMessages[0].id);
        await smsgMessageService.findOne(smsgMessages[0].id).catch(e =>
            expect(e).toEqual(new NotFoundException(smsgMessages[0].id))
        );

        const smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        expect(smsgMessages.length).toBe(2);
    });




});
