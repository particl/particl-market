// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * from 'jest';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { SmsgMessageService } from '../../src/api/services/model/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../src/api/requests/model/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../src/api/factories/model/SmsgMessageFactory';
import { ActionDirection } from '../../src/api/enums/ActionDirection';
import { ListingItemAddMessage } from '../../src/api/messages/action/ListingItemAddMessage';
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemAddMessageFactory } from '../../src/api/factories/message/ListingItemAddMessageFactory';
import { ProposalAddMessageFactory } from '../../src/api/factories/message/ProposalAddMessageFactory';
import { CoreSmsgMessage } from '../../src/api/messages/CoreSmsgMessage';
import { ProposalAddMessage } from '../../src/api/messages/action/ProposalAddMessage';
import { ProposalCategory } from '../../src/api/enums/ProposalCategory';
import { SmsgSendParams } from '../../src/api/requests/action/SmsgSendParams';
import { ListingItemAddRequest } from '../../src/api/requests/action/ListingItemAddRequest';
import { ProposalAddRequest } from '../../src/api/requests/action/ProposalAddRequest';


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
    let listingItem: resources.ListingItem;

    let listingItemCoreMessage: CoreSmsgMessage;
    let proposalCoreMessage: CoreSmsgMessage;

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

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket, false);
        const listingItemAddMessage: ListingItemAddMessage = await listingItemAddMessageFactory.get({
            sendParams: {
                wallet: sellerMarket.Identity.wallet
            } as SmsgSendParams,
            listingItem,
            sellerAddress: sellerMarket.Identity.address
        } as ListingItemAddRequest).then(value => value.action as ListingItemAddMessage);

        listingItemCoreMessage = await testDataService.generateCoreSmsgMessage(listingItemAddMessage, bidderMarket.publishAddress, bidderMarket.receiveAddress);

        // log.debug('listingItemMessage: ', JSON.stringify(listingItemCoreMessage, null, 2));

        const proposalAddMessage: ProposalAddMessage = await proposalAddMessageFactory.get({
            sendParams: {
                wallet: sellerMarket.Identity.wallet
            } as SmsgSendParams,
            sender: sellerMarket.Identity,
            market: bidderMarket,
            category: ProposalCategory.PUBLIC_VOTE,
            title: Faker.random.words(5),
            description: Faker.random.words(30),
            options: ['OPTION1', 'OPTION2', 'OPTION3']
        } as ProposalAddRequest).then(value => value.action as ProposalAddMessage);

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
        // log.debug('result: ', JSON.stringify(smsgMessages, null, 2));

        expect(smsgMessages.length).toBe(2);
    });


});
