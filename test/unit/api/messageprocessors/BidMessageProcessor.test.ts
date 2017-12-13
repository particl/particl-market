import { BidMessageProcessor } from '../../../../src/api/messageprocessors/BidMessageProcessor';
import { LogMock } from '../../lib/LogMock';


describe('BidMessageProcessor', () => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    let bidMessageProcessor;
    let bidService;
    let listingItemService;
    let bidFactory;
    let req;
    let listingReq;

    beforeEach(() => {
        process.env.AUTH0_HOST = 'test';
        bidMessageProcessor = new BidMessageProcessor(bidFactory, bidService, listingItemService, LogMock);

        req = {
            version: '0.1.1.0',
            item: 'f08f3d6e',
            status: 'ACTIVE',
            objects: [
              {
                id: 'colour',
                value: 'black'
              }
            ]
        };

        listingReq = {
            hash: 'f08f3d6e'
        };
    });

    test('Should pass the bid message in to the bidMessageProcessor', () => {
        bidFactory = {
            get: jest.fn(req).mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => (req)
                    });
                    expect(req.item).toBe('f08f3d6e');
                    expect(req.status).toBe('ACTIVE');
                    expect(req.objects[0].id).toBe('colour');
                    expect(req.objects[0].value).toBe('value');
                });
            })
        };

        bidService = {
            create: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => (req)
                    });
                    expect(req.item).toBe('f08f3d6e');
                 });
            })
        };

        listingItemService = {
            findOneByHash: jest.fn().mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    resolve({
                        toJSON: () => ({
                            hash: 'f08f3d6e'
                        })
                    });
                    expect(listingReq.hash).toBe('f08f3d6e');
                 });
            })
        };

        const pop = new BidMessageProcessor(bidFactory, bidService, listingItemService, LogMock);
        pop.process(req);
    });
});
