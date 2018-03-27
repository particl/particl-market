import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../../src/api/exceptions/ValidationException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { BidMessageProcessor } from '../../../src/api/messageprocessors/BidMessageProcessor';
import { RejectBidMessageProcessor } from '../../../src/api/messageprocessors/RejectBidMessageProcessor';
import { AcceptBidMessageProcessor } from '../../../src/api/messageprocessors/AcceptBidMessageProcessor';
import { CancelBidMessageProcessor } from '../../../src/api/messageprocessors/CancelBidMessageProcessor';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidService } from '../../../src/api/services/BidService';
import { BidSearchParams } from '../../../src/api/requests/BidSearchParams';
import { MarketService } from '../../../src/api/services/MarketService';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { BidMessage } from '../../../src/api/messages/BidMessage';
import { ListingItem } from '../../../src/api/models/ListingItem';

describe('AcceptBidMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();
    const testBidData = {
        action: BidMessageType.MPA_BID,
        listing: ''
    };

    let testDataService: TestDataService;
    let bidMessageProcessor: BidMessageProcessor;
    let rejectBidMessageProcessor: RejectBidMessageProcessor;
    let cancelBidMessageProcessor: CancelBidMessageProcessor;
    let acceptBidMessageProcessor: AcceptBidMessageProcessor;
    let listingItemService: ListingItemService;
    let bidService: BidService;
    let marketService: MarketService;
    let createdListingItem;

    beforeAll(async () => {

        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);

        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);

        bidMessageProcessor = app.IoC.getNamed<BidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.BidMessageProcessor);

        acceptBidMessageProcessor = app.IoC.getNamed<AcceptBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.AcceptBidMessageProcessor);

        rejectBidMessageProcessor = app.IoC.getNamed<RejectBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.RejectBidMessageProcessor);

        cancelBidMessageProcessor = app.IoC.getNamed<CancelBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.CancelBidMessageProcessor);

        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();


        // listing-item
        const defaultMarket = await marketService.getDefault();
        createdListingItem = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.Id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because empty message', async () => {
        expect.assertions(1);
        await acceptBidMessageProcessor.process({} as BidMessage).catch(e => {
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
    });

    test('Should throw ValidationException because no action', async () => {
        expect.assertions(1);
        await acceptBidMessageProcessor.process({listing: createdListingItem.Hash } as BidMessage).catch(e => {
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
    });

    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);
        await acceptBidMessageProcessor.process(testBidData as BidMessage).catch(e =>
            expect(e).toEqual(new ValidationException('Message body is not valid', [])
        );
    });

    test('Should throw MessageException because no bid found for givin listing hash', async () => {
        testBidData.listing = createdListingItem.Hash;
        const bidModel = await acceptBidMessageProcessor.process({action: BidMessageType.MPA_ACCEPT, listing: 'TEST-HASH' } as BidMessage).catch(e =>
            expect(e).toEqual(new NotFoundException('TEST-HASH'))
        );
    });

    test('Should accept a bid for the given listing item', async () => {
        // create bid message
        await bidMessageProcessor.process(testBidData as BidMessage);

        // accept a bid
        testBidData.action = BidMessageType.MPA_ACCEPT;
        const bidModel = await acceptBidMessageProcessor.process(testBidData as BidMessage);
        const result = bidModel.toJSON();
        // test the values
        expect(result.action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result.listingItemId).toBe(createdListingItem.id);
        expect(result.BidDatas.length).toBe(0);
    });

    test('Should return two bids with latest one created with Accept action for the given listing item', async () => {
        const bids = await bidService.search({listingItemId: createdListingItem.Id} as BidSearchParams);
        const bidResults = bids.toJSON();
        expect(bidResults.length).toBe(2);
        expect(bidResults[0].action).toBe(BidMessageType.MPA_BID);
        expect(bidResults[1].action).toBe(BidMessageType.MPA_ACCEPT);
    });

    test('Should not cancel the bid becuase bid was alredy been accepted', async () => {
        // cancel bid
        testBidData.action = BidMessageType.MPA_CANCEL;
        await cancelBidMessageProcessor.process(testBidData as BidMessage).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );
    });

    test('Should not reject the bid becuase bid was alredy been accepted', async () => {
        // reject a bid
        testBidData.action = BidMessageType.MPA_REJECT;
        await rejectBidMessageProcessor.process(testBidData as BidMessage).catch(e =>
            expect(e).toEqual(new MessageException('Invalid BidMessageType.'))
        );
    });

    test('Should return empty bids for the given listing item because listing item has removed', async () => {
        // delete listing item
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
        // search bids for the deleted listing item
        const bids = await bidService.search({listingItemId: createdListingItem.Id} as BidSearchParams);
        const bidResults = bids.toJSON();
        expect(bidResults.length).toBe(0);
    });
});
