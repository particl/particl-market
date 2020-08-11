// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { SmsgMessage } from '../../src/api/models/SmsgMessage';
import { SmsgMessageService } from '../../src/api/services/model/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../src/api/requests/model/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../src/api/factories/model/SmsgMessageFactory';
import { SmsgMessageStatus } from '../../src/api/enums/SmsgMessageStatus';
import { CoreSmsgMessage } from '../../src/api/messages/CoreSmsgMessage';
import { SmsgMessageSearchParams } from '../../src/api/requests/search/SmsgMessageSearchParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionMessageTypes } from '../../src/api/enums/ActionMessageTypes';
import { GovernanceAction } from '../../src/api/enums/GovernanceAction';
import { SmsgMessageCreateParams } from '../../src/api/factories/model/ModelCreateParams';
import { ActionDirection } from '../../src/api/enums/ActionDirection';
import { SmsgMessageSearchOrderField } from '../../src/api/enums/SearchOrderField';
import { ListingItemAddMessage } from '../../src/api/messages/action/ListingItemAddMessage';
import { ListingItemAddMessageCreateParams } from '../../src/api/requests/message/ListingItemAddMessageCreateParams';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ListingItemAddMessageFactory } from '../../src/api/factories/message/ListingItemAddMessageFactory';
import { VoteService } from '../../src/api/services/model/VoteService';
import { ProposalService } from '../../src/api/services/model/ProposalService';
import { ProposalAddMessageFactory } from '../../src/api/factories/message/ProposalAddMessageFactory';
import { VoteMessageFactory } from '../../src/api/factories/message/VoteMessageFactory';
import { ProposalAddMessage } from '../../src/api/messages/action/ProposalAddMessage';
import { ProposalAddMessageCreateParams } from '../../src/api/requests/message/ProposalAddMessageCreateParams';
import { ProposalCategory } from '../../src/api/enums/ProposalCategory';

describe('SmsgMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let smsgMessageService: SmsgMessageService;
    let smsgMessageFactory: SmsgMessageFactory;
    let defaultMarketService: DefaultMarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;
    let voteService: VoteService;
    let proposalService: ProposalService;
    let listingItemAddMessageFactory: ListingItemAddMessageFactory;
    let proposalAddMessageFactory: ProposalAddMessageFactory;
    let voteMessageFactory: VoteMessageFactory;

    let smsgMessages: resources.SmsgMessage[];
    let sellerMarket: resources.Market;
    let sellerProfile: resources.Profile;
    let listingItemTemplate: resources.ListingItemTemplate;

    let listingItemCoreMessage: CoreSmsgMessage;
    let proposalCoreMessage: CoreSmsgMessage;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDER = SearchOrder.DESC;
    const ORDER_FIELD = SmsgMessageSearchOrderField.RECEIVED;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.model.SmsgMessageFactory);
        listingItemAddMessageFactory = app.IoC.getNamed<ListingItemAddMessageFactory>(Types.Factory, Targets.Factory.message.ListingItemAddMessageFactory);
        proposalAddMessageFactory = app.IoC.getNamed<ProposalAddMessageFactory>(Types.Factory, Targets.Factory.message.ProposalAddMessageFactory);
        voteMessageFactory = app.IoC.getNamed<VoteMessageFactory>(Types.Factory, Targets.Factory.message.VoteMessageFactory);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        voteService = app.IoC.getNamed<VoteService>(Types.Service, Targets.Service.model.VoteService);
        proposalService = app.IoC.getNamed<ProposalService>(Types.Service, Targets.Service.model.ProposalService);

        sellerProfile = await profileService.getDefault().then(value => value.toJSON());
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());

    });

    test('Should throw ValidationException because we want to create a empty SmsgMessage', async () => {
        expect.assertions(1);
        await smsgMessageService.create({} as SmsgMessageCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new SmsgMessage from IncomingSmsgMessage (listingItemMessage)', async () => {

        listingItemTemplate = await testDataService.generateListingItemTemplate(sellerProfile, sellerMarket);

        const listingItemAddMessage: ListingItemAddMessage = await listingItemAddMessageFactory.get({
            listingItem: listingItemTemplate,
            sellerAddress: sellerMarket.Identity.address,
            signature: Faker.random.uuid()
        } as ListingItemAddMessageCreateParams);
        listingItemCoreMessage = await testDataService.generateCoreSmsgMessage(listingItemAddMessage, sellerMarket.publishAddress, sellerMarket.receiveAddress);

        log.debug('listingItemMessage: ', JSON.stringify(listingItemCoreMessage, null, 2));

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: listingItemCoreMessage
        } as SmsgMessageCreateParams);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, MPAction.MPA_LISTING_ADD, SmsgMessageStatus.NEW, listingItemCoreMessage);

        const result: resources.SmsgMessage = await smsgMessageService.create(smsgMessageCreateRequest).then(value => value.toJSON());
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, MPAction.MPA_LISTING_ADD, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });

    test('Should create a new SmsgMessage from IncomingSmsgMessage (proposalMessage)', async () => {

        const proposalAddMessage: ProposalAddMessage = await proposalAddMessageFactory.get({
            title: Faker.random.words(5),
            description: Faker.random.words(30),
            options: ['OPTION1', 'OPTION2', 'OPTION3'],
            sender: sellerMarket.Identity,
            category: ProposalCategory.PUBLIC_VOTE,
            market: sellerMarket.receiveAddress
        } as ProposalAddMessageCreateParams);
        proposalCoreMessage = await testDataService.generateCoreSmsgMessage(proposalAddMessage, sellerMarket.publishAddress, sellerMarket.receiveAddress);

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: proposalCoreMessage
        } as SmsgMessageCreateParams);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, GovernanceAction.MPA_PROPOSAL_ADD, SmsgMessageStatus.NEW, proposalCoreMessage);

        const result: resources.SmsgMessage = await smsgMessageService.create(smsgMessageCreateRequest).then(value => value.toJSON());
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, GovernanceAction.MPA_PROPOSAL_ADD, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });

    /*
    test('Should create a new SmsgMessage from IncomingSmsgMessage (voteMessage)', async () => {

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: voteMessage
        } as SmsgMessageCreateParams);
        log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        expectCreateRequestFromSmsgMessage(smsgMessageCreateRequest, GovernanceAction.MPA_VOTE, SmsgMessageStatus.NEW, voteMessage);

        const result: resources.SmsgMessage = await smsgMessageService.create(smsgMessageCreateRequest).then(value => value.toJSON());
        log.debug('result: ', JSON.stringify(result, null, 2));
        expectSmsgMessageFromCreateRequest(result, GovernanceAction.MPA_VOTE, SmsgMessageStatus.NEW, smsgMessageCreateRequest);
    });
*/

    test('Should list all SmsgMessages', async () => {
        smsgMessages = await smsgMessageService.findAll().then(value => value.toJSON());
        expect(smsgMessages.length).toBe(2);
    });

    test('Should find one SmsgMessage using id', async () => {
        const result: resources.SmsgMessage = await smsgMessageService.findOne(smsgMessages[0].id).then(value => value.toJSON());

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
        const result: resources.SmsgMessage = await smsgMessageService.findOneByMsgId(smsgMessages[0].msgid).then(value => value.toJSON());

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

        const result: resources.SmsgMessage = await smsgMessageService.update(smsgMessages[0].id, updatedData).then(value => value.toJSON());

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

    test('Should searchBy for SmsgMessages: [MPA_LISTING_ADD], NEW/INCOMING', async () => {
        const searchParams = {
            page: PAGE,
            pageLimit: PAGE_LIMIT,
            order: ORDER,
            orderField: ORDER_FIELD,
            types: [MPAction.MPA_LISTING_ADD],
            status: SmsgMessageStatus.NEW,
            direction: ActionDirection.INCOMING,
            age: 0
        } as SmsgMessageSearchParams;

        smsgMessages = await smsgMessageService.searchBy(searchParams).then(value => value.toJSON());
        expect(smsgMessages.length).toBe(1);
    });

    test('Should searchBy for SmsgMessages: [MPA_LISTING_ADD, MPA_PROPOSAL_ADD], NEW/INCOMING', async () => {
        const searchParams = {
            page: PAGE,
            pageLimit: PAGE_LIMIT,
            order: ORDER,
            orderField: ORDER_FIELD,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MPA_PROPOSAL_ADD],
            status: SmsgMessageStatus.NEW,
            direction: ActionDirection.INCOMING,
            age: 0
        } as SmsgMessageSearchParams;

        smsgMessages = await smsgMessageService.searchBy(searchParams).then(value => value.toJSON());

        expect(smsgMessages.length).toBe(2);
    });
/*
    test('Should searchBy for SmsgMessages: [MPA_LISTING_ADD, MPA_PROPOSAL_ADD, MPA_VOTE], status: NEW', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderField: SmsgMessageSearchOrderField.RECEIVED,
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MPA_PROPOSAL_ADD, GovernanceAction.MPA_VOTE],
            age: 0
        } as SmsgMessageSearchParams;

        smsgMessages = await smsgMessageService.searchBy(searchParams).then(value => value.toJSON());

        log.debug('smsgMessages:', JSON.stringify(smsgMessages, null, 2));
        expect(smsgMessages.length).toBe(2);
    });
*/
    test('Should searchBy for SmsgMessages: empty types [] should find all', async () => {
        const searchParams = {
            page: PAGE,
            pageLimit: PAGE_LIMIT,
            order: ORDER,
            orderField: ORDER_FIELD,
            types: [] as ActionMessageTypes[],
            status: SmsgMessageStatus.NEW,
            direction: ActionDirection.INCOMING,
            age: 0
        } as SmsgMessageSearchParams;

        smsgMessages = await smsgMessageService.searchBy(searchParams).then(value => value.toJSON());
        expect(smsgMessages.length).toBe(2);

    });

    test('Should update SmsgMessage status to SmsgMessageStatus.PROCESSING', async () => {

        expect(smsgMessages.length).toBe(2);

        const message = _.find(smsgMessages, { type: MPAction.MPA_LISTING_ADD });

        const updatedData = message;
        updatedData.status = SmsgMessageStatus.PROCESSING;

        const result: resources.SmsgMessage = await smsgMessageService.update(message.id, updatedData).then(value => value.toJSON());
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

    test('Should searchBy for SmsgMessages: [MPA_LISTING_ADD, MPA_PROPOSAL_ADD, MPA_VOTE], status: NEW', async () => {
        const searchParams = {
            order: SearchOrder.DESC,
            orderField: SmsgMessageSearchOrderField.RECEIVED,
            status: SmsgMessageStatus.NEW,
            types: [MPAction.MPA_LISTING_ADD, GovernanceAction.MPA_PROPOSAL_ADD, GovernanceAction.MPA_VOTE],
            age: 0
        } as SmsgMessageSearchParams;

        smsgMessages = await smsgMessageService.searchBy(searchParams).then(value => value.toJSON());
        expect(smsgMessages.length).toBe(1);
    });

    test('Should find the last inserted SmsgMessage', async () => {
        smsgMessages = await smsgMessageService.findAll().then(value => value.toJSON());
        expect(smsgMessages.length).toBe(2);
        let latest: resources.SmsgMessage = smsgMessages[0];
        for (const msg of smsgMessages) {
            if (msg.id > latest.id) {
                latest = msg;
            }
        }

        const smsgMessage: resources.SmsgMessage = await smsgMessageService.findLast().then(value => value.toJSON());
        expect(smsgMessage.received).toBe(latest.received);
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
        expect(smsgMessages.length).toBe(1);
    });

    const expectCreateRequestFromSmsgMessage = (
        result: SmsgMessageCreateRequest,
        type: ActionMessageTypes,
        status: SmsgMessageStatus,
        smsgMessage: CoreSmsgMessage) => {

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

    };

});
