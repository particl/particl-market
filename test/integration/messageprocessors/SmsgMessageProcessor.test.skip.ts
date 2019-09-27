// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Targets, Types } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/model/MarketService';
import { ListingItemFactory } from '../../../src/api/factories/model/ListingItemFactory';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/testdata/TestDataGenerateRequest';
import { ProfileService } from '../../../src/api/services/model/ProfileService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { ListingItemService } from '../../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../../src/api/services/model/ListingItemTemplateService';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { SmsgMessageService } from '../../../src/api/services/model/SmsgMessageService';
import { SmsgMessageCreateRequest } from '../../../src/api/requests/model/SmsgMessageCreateRequest';
import { SmsgMessageFactory } from '../../../src/api/factories/model/SmsgMessageFactory';
import { WaitingMessageProcessor } from '../../../src/api/messageprocessors/WaitingMessageProcessor';
import { SmsgMessageSearchParams } from '../../../src/api/requests/search/SmsgMessageSearchParams';
import { SearchOrder } from '../../../src/api/enums/SearchOrder';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ListingItemAddMessageFactory } from '../../../src/api/factories/message/ListingItemAddMessageFactory';
import { ListingItemAddMessageCreateParams } from '../../../src/api/requests/message/MessageCreateParamsInterface';
import { ListingItemAddMessage } from '../../../src/api/messages/action/ListingItemAddMessage';
import { ompVersion } from 'omp-lib/dist/omp';
import { CoreSmsgMessage } from '../../../src/api/messages/CoreSmsgMessage';
import { ActionDirection } from '../../../src/api/enums/ActionDirection';


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
    let listingItemAddMessageFactory: ListingItemAddMessageFactory;
    let listingItemFactory: ListingItemFactory;
    let smsgMessageFactory: SmsgMessageFactory;
    let messageProcessor: WaitingMessageProcessor;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let listingItemTemplates: resources.ListingItemTemplate[];
    let smsgMessages: resources.SmsgMessage[] = [];

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        smsgMessageService = app.IoC.getNamed<SmsgMessageService>(Types.Service, Targets.Service.model.SmsgMessageService);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.model.ListingItemFactory);
        listingItemAddMessageFactory = app.IoC.getNamed<ListingItemAddMessageFactory>(Types.Factory, Targets.Factory.message.ListingItemAddMessageFactory);
        smsgMessageFactory = app.IoC.getNamed<SmsgMessageFactory>(Types.Factory, Targets.Factory.model.SmsgMessageFactory);
        messageProcessor = app.IoC.getNamed<WaitingMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.MessageProcessor);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

    });
    // tslint:enable:max-line-length

    const createSmsgMessage = async (listingItemTemplate: resources.ListingItemTemplate, index: number): resources.SmsgMessage => {

        // prepare the message to be processed
        const listingItemAddMessage: ListingItemAddMessage = await listingItemAddMessageFactory.get({
            listingItem: listingItemTemplate
        } as ListingItemAddMessageCreateParams);

        const marketplaceMessage: MarketplaceMessage = {
            version: ompVersion(),
            action: listingItemAddMessage
        };

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
        } as CoreSmsgMessage;

        const smsgMessageCreateRequest: SmsgMessageCreateRequest = await smsgMessageFactory.get({
            direction: ActionDirection.INCOMING,
            message: listingItemSmsg
        });
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

    test('Should generate 10 ListingItemTemplates', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
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

        // generate 10 ListingItemTemplates without a ListingItem
        listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 10,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        expect(listingItemTemplates.length).toBe(10);
        log.debug('generated ' + listingItemTemplates.length + ' listingItemTemplates');

    }, 1200000); // timeout to 1200s

    test('Should process 10 SmsgMessages and set status PROCESSED', async () => {

        expect(smsgMessages.length).toBe(0);

        let i = 1;
        for (const listingItemTemplate of listingItemTemplates) {
            smsgMessages.push(await createSmsgMessage(listingItemTemplate, i));
            i++;
        }
        expect(smsgMessages.length).toBe(10);

        log.debug('CREATED ' + listingItemTemplates.length + ' SMSGMESSAGES ');

        // smsgMessages need to be 20++ seconds old to be found using polling
        await testUtil.waitFor(21);

        smsgMessages = await smsgMessageService.findAll()
            .then(value => value.toJSON());
        expect(smsgMessages.length).toBe(10);

        const newSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [MPAction.MPA_LISTING_ADD],
            status: SmsgMessageStatus.NEW,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const processingSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [MPAction.MPA_LISTING_ADD],
            status: SmsgMessageStatus.PROCESSING,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const processedSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [MPAction.MPA_LISTING_ADD],
            status: SmsgMessageStatus.PROCESSED,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        const failedSearchParams = {
            order: SearchOrder.DESC,
            orderByColumn: 'received',
            types: [MPAction.MPA_LISTING_ADD],
            status: SmsgMessageStatus.PROCESSING_FAILED,
            page: 0,
            pageLimit: 101,
            age: 1000 * 20
        } as SmsgMessageSearchParams;

        // call poll for 10 times
        for (const smsgMessage of smsgMessages) {
            await messageProcessor.poll(true);
            await testUtil.waitFor(1);
        }

        let processedCount = 0;
        while (processedCount !== 10) {
            const newMessages: resources.SmsgMessage[] = await smsgMessageService.searchBy(newSearchParams)
                .then(value => value.toJSON());

            const processingMessages: resources.SmsgMessage[] = await smsgMessageService.searchBy(processingSearchParams)
                .then(value => value.toJSON());

            const processedMessages: resources.SmsgMessage[] = await smsgMessageService.searchBy(processedSearchParams)
                .then(value => value.toJSON());

            const failedMessages: resources.SmsgMessage[] = await smsgMessageService.searchBy(failedSearchParams)
                .then(value => value.toJSON());

            log.debug('new: ' + newMessages.length + ', processing: ' + processingMessages.length + ', failed: '
                + failedMessages.length + ', PROCESSED: ' + processedMessages.length);

            // TODO: this is commented out due to database locks, should uncomment after those are fixed
            // expect(failedMessages.length).toBe(0);
            processedCount = processedMessages.length;

            // expect(newMessages.length + processingMessages.length + processedMessages.length).toBe(100);

            await testUtil.waitFor(1);
        }

        await testUtil.waitFor(1);

        smsgMessages = await smsgMessageService.findAll()
            .then(value => value.toJSON());
        expect(smsgMessages.length).toBe(10);

        // expect all smsgmessages to have status PROCESSED
        for (const smsgMessage of smsgMessages) {
            expect(smsgMessage.status).toBe(SmsgMessageStatus.PROCESSED);
        }

    }, 1200000); // timeout to 1200s

});
