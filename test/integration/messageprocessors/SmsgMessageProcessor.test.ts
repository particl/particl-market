// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemFactory } from '../../../src/api/factories/ListingItemFactory';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import * as resources from 'resources';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import { ProfileService } from '../../../src/api/services/ProfileService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { ListingItemTemplateService } from '../../../src/api/services/ListingItemTemplateService';
import { IncomingSmsgMessage } from '../../../src/api/messages/IncomingSmsgMessage';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { SmsgMessageService } from '../../../src/api/services/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../../src/api/requests/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../../src/api/factories/SmsgMessageFactory';
import { MessageProcessor } from '../../../src/api/messageprocessors/MessageProcessor';
import { SmsgMessageSearchParams } from '../../../src/api/requests/SmsgMessageSearchParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { ListingItemMessageType } from '../../../src/api/enums/ListingItemMessageType';


describe('MessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;
    let smsgMessageService: SmsgMessageService;
    let listingItemFactory: ListingItemFactory;
    let smsgMessageFactory: SmsgMessageFactory;
    let messageProcessor: MessageProcessor;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let listingItemTemplates: resources.ListingItemTemplate[];

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.SmsgMessageService);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.ListingItemFactory);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.SmsgMessageFactory);
        messageProcessor = app.IoC.getNamed<MessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.MessageProcessor);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

    });
    // tslint:enable:max-line-length

    const createSmsgMessage = async (listingItemTemplate: resources.ListingItemTemplate, index: number): resources.SmsgMessage => {

        // prepare the message to be processed
        const listingItemMessage: ListingItemMessage = await listingItemFactory.getMessage(listingItemTemplate);

        const marketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage,
            market: defaultMarket.address
        } as MarketplaceMessage;

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'TESTMESSAGE [' + index + '] : ' + new Date().getTime(),
            version: '0300',
            location: 'inbox',
            read: false,
            paid: false,
            payloadsize: 100,
            received: new Date().getTime(),
            sent: new Date().getTime(),
            expiration: new Date().getTime(),
            daysretention: 4,
            from: defaultProfile.address,
            to: defaultMarket.address,
            text: JSON.stringify(marketplaceMessage)
        } as IncomingSmsgMessage;

        // we have the message, so remove the template
        // await listingItemTemplateService.destroy(listingItemTemplates[0].id);

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get(listingItemSmsg);

        // this.log.debug('smsgMessageCreateRequest: ', JSON.stringify(smsgMessageCreateRequest, null, 2));
        return await smsgMessageService.create(smsgMessageCreateRequest)
            .then(async smsgMessageModel => {

                const smsgMessage: resources.SmsgMessage = smsgMessageModel.toJSON();
                log.debug('SAVED SMSGMESSAGE: '
                    + smsgMessage.from + ' => ' + smsgMessage.to
                    + ' : ' + smsgMessage.type
                    + ' : ' + smsgMessage.status
                    + ' : ' + smsgMessage.msgid);
                return smsgMessage;
            });
    };

    test('Should generate 100 ListingItemTemplates', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false, // true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id,    // profileId
            false,  // generateListingItem
            defaultMarket.id     // marketId
        ]).toParamsArray();

        // generate 100 templates without an item
        listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 100,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        expect(listingItemTemplates.length).toBe(100);
        log.debug('generated ' + listingItemTemplates.length + ' listingItemTemplates');

    }, 1200000); // timeout to 1200s

    test('Should process 100 SmsgMessages and set status PROCESSING', async () => {

        let smsgMessages: resources.SmsgMessage[] = [];

        let i = 1;
        for (const listingItemTemplate of listingItemTemplates) {
            smsgMessages.push(await createSmsgMessage(listingItemTemplate, i));
            i++;
        }
        expect(smsgMessages.length).toBe(100);

        log.debug('CREATED ' + listingItemTemplates.length + ' SMSGMESSAGES ');

        // smsgMessages need to be 20++ seconds old to be found using polling
        await testUtil.waitFor(20);

        // call poll for each of the smsgmessages, skip emitEvent
        for (const smsgMessage of smsgMessages) {
            await messageProcessor.poll(false);
        }

        let smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        expect(smsgMessages.length).toBe(100);

        // expect all smsgmessages to have status PROCESSING
        for (const smsgMessage of smsgMessages) {
            // log.debug('smsgMessage.status: ' + smsgMessage.status + ' === ' + SmsgMessageStatus.PROCESSING);
            expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSING);
        }

        // remove all smsgMessages
        for (const smsgMessage of smsgMessages) {
            await smsgMessageService.destroy(smsgMessage.id);
        }
        smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        expect(smsgMessages.length).toBe(0);

    }, 600000); // timeout to 600s

    test('Should process 100 SmsgMessages and set status PROCESSED', async () => {

        let smsgMessages: resources.SmsgMessage[] = [];

        let i = 1;
        for (const listingItemTemplate of listingItemTemplates) {
            smsgMessages.push(await createSmsgMessage(listingItemTemplate, i));
            i++;
        }
        expect(smsgMessages.length).toBe(100);

        log.debug('CREATED ' + listingItemTemplates.length + ' SMSGMESSAGES ');

        // smsgMessages need to be 20++ seconds old to be found using polling
        await testUtil.waitFor(20);

        // start polling
        // messageProcessor.schedulePoll();

        let smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        expect(smsgMessages.length).toBe(100);

        const newSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [ListingItemMessageType.MP_ITEM_ADD],
            status: SmsgMessageStatus.NEW,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const processingSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [ListingItemMessageType.MP_ITEM_ADD],
            status: SmsgMessageStatus.PROCESSING,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const processedSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [ListingItemMessageType.MP_ITEM_ADD],
            status: SmsgMessageStatus.PROCESSED,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const failedSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [ListingItemMessageType.MP_ITEM_ADD],
            status: SmsgMessageStatus.PROCESSING_FAILED,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        // call poll for 100 times
        for (const smsgMessage of smsgMessages) {
            await messageProcessor.poll(true);
            await testUtil.waitFor(1);
        }

        let processedCount = 0;
        while (processedCount !== 100) {
            const newMessagesModel = await smsgMessageService.searchBy(newSearchParams);
            const newMessages = newMessagesModel.toJSON();

            const processingMessagesModel = await smsgMessageService.searchBy(processingSearchParams);
            const processingMessages = processingMessagesModel.toJSON();

            const processedMessagesModel = await smsgMessageService.searchBy(processedSearchParams);
            const processedMessages = processedMessagesModel.toJSON();

            const failedMessagesModel = await smsgMessageService.searchBy(failedSearchParams);
            const failedMessages = failedMessagesModel.toJSON();

            log.debug('new: ' + newMessages.length + ', processing: ' + processingMessages.length + ', failed: ' + failedMessages.length + ', PROCESSED: ' + processedMessages.length);

            expect(failedMessages.length).toBe(0);
            processedCount = processedMessages.length;

            // expect(newMessages.length + processingMessages.length + processedMessages.length).toBe(100);

            await testUtil.waitFor(1);
        }

        await testUtil.waitFor(1);

        smsgMessageCollection = await smsgMessageService.findAll();
        smsgMessages = smsgMessageCollection.toJSON();
        expect(smsgMessages.length).toBe(100);

        // expect all smsgmessages to have status PROCESSED
        for (const smsgMessage of smsgMessages) {
            expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);
        }

    }, 600000); // timeout to 600s

});
