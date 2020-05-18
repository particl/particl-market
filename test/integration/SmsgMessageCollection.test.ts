// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { SmsgMessageService } from '../../src/api/services/model/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../src/api/requests/model/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../src/api/factories/model/SmsgMessageFactory';
import { ActionDirection } from '../../src/api/enums/ActionDirection';
import {ListingItemAddMessage} from '../../src/api/messages/action/ListingItemAddMessage';
import * as Faker from "faker";
import {ListingItemAddMessageCreateParams} from '../../src/api/requests/message/ListingItemAddMessageCreateParams';
import {DefaultMarketService} from '../../src/api/services/DefaultMarketService';
import {MarketService} from '../../src/api/services/model/MarketService';
import {ProfileService} from '../../src/api/services/model/ProfileService';
import {ListingItemAddMessageFactory} from '../../src/api/factories/message/ListingItemAddMessageFactory';
import {ProposalAddMessageFactory} from '../../src/api/factories/message/ProposalAddMessageFactory';
import {CoreSmsgMessage} from '../../src/api/messages/CoreSmsgMessage';
import {ProposalAddMessage} from '../../src/api/messages/action/ProposalAddMessage';
import {ProposalCategory} from '../../src/api/enums/ProposalCategory';
import {ProposalAddMessageCreateParams} from '../../src/api/requests/message/ProposalAddMessageCreateParams';
import {SmsgMessageCreateParams} from '../../src/api/factories/model/ModelCreateParams';

describe('SmsgMessageCollection', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let smsgMessageService: SmsgMessageService;
    let smsgMessageFactory: SmsgMessageFactory;
    let defaultMarketService: DefaultMarketService;
    let profileService: ProfileService;
    let listingItemAddMessageFactory: ListingItemAddMessageFactory;
    let proposalAddMessageFactory: ProposalAddMessageFactory;

    let smsgMessages: resources.SmsgMessage[];
    let bidderMarket: resources.Market;
    let sellerMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let listingItemTemplate: resources.ListingItemTemplate;

    let listingItemCoreMessage: CoreSmsgMessage;
    let proposalCoreMessage: CoreSmsgMessage;


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
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemAddMessageFactory = app.IoC.getNamed<ListingItemAddMessageFactory>(Types.Factory, Targets.Factory.message.ListingItemAddMessageFactory);
        proposalAddMessageFactory = app.IoC.getNamed<ProposalAddMessageFactory>(Types.Factory, Targets.Factory.message.ProposalAddMessageFactory);


        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await defaultMarketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        sellerMarket = await defaultMarketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());


    });

    test('Should save multiple SmsgMessages at once', async () => {

        listingItemTemplate = await testDataService.generateListingItemTemplate(sellerProfile, bidderMarket);

        const listingItemAddMessage: ListingItemAddMessage = await listingItemAddMessageFactory.get({
            listingItem: listingItemTemplate,
            seller: sellerMarket.Identity.address,
            signature: Faker.random.uuid()
        } as ListingItemAddMessageCreateParams);
        listingItemCoreMessage = await testDataService.generateCoreSmsgMessage(listingItemAddMessage, bidderMarket.publishAddress, bidderMarket.receiveAddress);

        log.debug('listingItemMessage: ', JSON.stringify(listingItemCoreMessage, null, 2));

        const proposalAddMessage: ProposalAddMessage = await proposalAddMessageFactory.get({
            title: Faker.random.words(5),
            description: Faker.random.words(30),
            options: ['OPTION1', 'OPTION2', 'OPTION3'],
            sender: sellerMarket.Identity,
            category: ProposalCategory.PUBLIC_VOTE,
            market: bidderMarket.receiveAddress
        } as ProposalAddMessageCreateParams);
        proposalCoreMessage = await testDataService.generateCoreSmsgMessage(proposalAddMessage, bidderMarket.publishAddress, bidderMarket.receiveAddress);

        const smsgMessageCreateRequest1: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: listingItemCoreMessage
        });
        const smsgMessageCreateRequest2: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: proposalCoreMessage
        });

        const result = await smsgMessageService.createAll([
            smsgMessageCreateRequest1,
            smsgMessageCreateRequest2
        ]);
        log.debug('result id: ', result);

        smsgMessages = await smsgMessageService.findAll().then(value => value.toJSON());
        log.debug('result: ', JSON.stringify(smsgMessages, null, 2));

        expect(smsgMessages.length).toBe(2);
    });


});
