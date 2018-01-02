import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { BidService } from '../../../src/api/services/BidService';
import { BidMessageProcessor } from '../../../src/api/messageprocessors/BidMessageProcessor';
import { RejectBidMessageProcessor } from '../../../src/api/messageprocessors/RejectBidMessageProcessor';
import { CancelBidMessageProcessor } from '../../../src/api/messageprocessors/CancelBidMessageProcessor';
import { AcceptBidMessageProcessor } from '../../../src/api/messageprocessors/AcceptBidMessageProcessor';
import { BidStatus } from '../../../src/api/enums/BidStatus';
import { BidSearchParams } from '../../../src/api/requests/BidSearchParams';

describe('RejectBidMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();
    const testBidData = {
        action: 'MPA_BID',
        item: 'f08f3d6e101'
    };

    let testDataService: TestDataService;
    let bidMessageProcessor: BidMessageProcessor;
    let rejectBidMessageProcessor: RejectBidMessageProcessor;
    let cancelBidMessageProcessor: CancelBidMessageProcessor;
    let acceptBidMessageProcessor: AcceptBidMessageProcessor;
    let listingItemService: ListingItemService;
    let bidService: BidService;
    let listingItemModel;


    beforeAll(async () => {

        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);

        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);

        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        bidMessageProcessor = app.IoC.getNamed<BidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.BidMessageProcessor);

        rejectBidMessageProcessor = app.IoC.getNamed<RejectBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.RejectBidMessageProcessor);

        cancelBidMessageProcessor = app.IoC.getNamed<CancelBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.CancelBidMessageProcessor);

        acceptBidMessageProcessor = app.IoC.getNamed<AcceptBidMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.AcceptBidMessageProcessor);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });


    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);
        await rejectBidMessageProcessor.process(testBidData).catch(e =>
            expect(e).toEqual(new NotFoundException(testBidData.item))
        );
    });

    test('Should throw MessageException because no bid found for givin listing hash', async () => {
        // create the listingItem
        listingItemModel = await listingItemService.create({hash: 'TEST-HASH'});
        testBidData.item = listingItemModel.Hash;

        // throw MessageException because no bid found for givin listing hash
        const bidModel = await rejectBidMessageProcessor.process({action: 'MPA_REJECT', item: 'TEST-HASH' }).catch(e =>
            expect(e).toEqual(new MessageException('Bid with the listing Item was not found!'))
        );
    });

    test('Should reject a bid for the given listing item', async () => {
        // create bid message
        await bidMessageProcessor.process(testBidData);

        // reject bid
        testBidData.action = 'MPA_REJECT';
        const bidModel = await rejectBidMessageProcessor.process(testBidData);
        const result = bidModel.toJSON();
        // test the values
        expect(result.status).toBe(BidStatus.REJECTED);
        expect(result.listingItemId).toBe(listingItemModel.id);
        expect(result.BidData.length).toBe(0);
    });

    test('Should return two bids with latest one created with Reject status for the given listing item', async () => {
        const bids = await bidService.search({listingItemId: listingItemModel.id} as BidSearchParams);
        const bidResults = bids.toJSON();
        expect(bidResults.length).toBe(2);
        expect(bidResults[0].status).toBe('ACTIVE');
        expect(bidResults[1].status).toBe('REJECTED');
    });

    test('Should not cancel the bid becuase bid was alredy been rejected', async () => {
        // cancel bid
        testBidData.action = 'MPA_CANCEL';
        await cancelBidMessageProcessor.process(testBidData).catch(e =>
            expect(e).toEqual(new MessageException(`Bid can not be CANCELLED because it was already been ${BidStatus.REJECTED}`))
        );
    });

    test('Should not accepted the bid becuase bid was alredy been cancelled', async () => {
        // accept a bid
        testBidData.action = 'MPA_ACCEPT';
        await acceptBidMessageProcessor.process(testBidData).catch(e =>
           expect(e).toEqual(new MessageException(`Bid can not be ACCEPTED because it was already been ${BidStatus.REJECTED}`))
        );
    });

});
